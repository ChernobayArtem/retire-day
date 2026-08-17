import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {
  MIN_TARGET_SIZE,
  exceptions,
  targets,
} from '../design-tokens/target-size-contract.mjs'

const root = process.cwd()
const tokenFiles = [
  'src/ui/tokens/foundations.css',
  'src/ui/tokens/spacing-primitives.css',
  'src/ui/tokens/spacing-aliases.css',
  'src/ui/tokens/spacing-semantic.css',
]
const kitStylesheet = 'src/ui/ui.css'

const violations = []

async function read(relative) {
  return readFile(path.join(root, relative), 'utf8')
}

const tokenSource = (await Promise.all(tokenFiles.map(read))).join('\n')

/** Resolve `var(--x)` chains down to a literal value, as the browser would. */
function resolveValue(value, seen = new Set()) {
  const reference = value.trim().match(/^var\((--[\w-]+)\)$/)
  if (!reference) return value.trim()

  const name = reference[1]
  if (seen.has(name)) throw new Error(`circular token reference: ${name}`)
  seen.add(name)

  const declaration = tokenSource.match(new RegExp(`${name}:\\s*([^;]+);`))
  if (!declaration) throw new Error(`missing token: ${name}`)
  return resolveValue(declaration[1], seen)
}

function toPixels(value, label) {
  const resolved = resolveValue(value)
  const pixels = resolved.match(/^(\d+(?:\.\d+)?)px$/)
  if (!pixels) {
    violations.push(`${label}: "${value}" resolves to "${resolved}", which is not a pixel length`)
    return null
  }
  return Number(pixels[1])
}

// 1. Declared controls must reach the minimum on every axis they own.
for (const target of targets) {
  for (const axis of ['height', 'width']) {
    if (!target[axis]) continue
    const size = toPixels(target[axis], `${target.id} ${axis}`)
    if (size === null) continue
    if (size < MIN_TARGET_SIZE) {
      violations.push(
        `${target.id} (${target.selector}): ${axis} is ${size}px, below the ${MIN_TARGET_SIZE}px minimum, ` +
          'and it is not declared as a documented exception',
      )
    }
  }
}

// 2. Controls below the minimum must satisfy the exception they claim.
for (const exception of exceptions) {
  const size = toPixels(exception.size, `${exception.id} size`)
  if (size === null) continue

  if (size >= MIN_TARGET_SIZE) {
    violations.push(
      `${exception.id} (${exception.selector}): ${size}px already meets the minimum, ` +
        'so the exception is obsolete and should be removed from the contract',
    )
    continue
  }

  if (exception.exception !== 'spacing') {
    violations.push(`${exception.id}: unsupported exception "${exception.exception}"`)
    continue
  }

  // Undisturbed-circle rule: stacked instances need MIN_TARGET_SIZE between
  // centres. A row is never shorter than the control inside it, so the row
  // height plus the gap is at least `size + gap`.
  for (const context of exception.spacing) {
    const gap = toPixels(context.gap, `${exception.id} gap`)
    if (gap === null) continue
    const centreDistance = size + gap
    if (centreDistance < MIN_TARGET_SIZE) {
      violations.push(
        `${exception.id} in ${context.context}: stacked targets are at least ${centreDistance}px apart ` +
          `(${size}px control + ${gap}px gap), under the ${MIN_TARGET_SIZE}px the spacing exception requires`,
      )
    }
  }
}

// 3. No interactive control may exist in the kit without being declared here.
//    This is what keeps the contract honest as the kit grows.
const kitCss = await read(kitStylesheet)
const declared = new Set([
  ...targets.map((target) => target.selector),
  ...exceptions.map((exception) => exception.selector),
])
const interactivePattern = /^\.(ui-[a-z0-9-]*(?:button|tab|link|control))\s*[,{]/gm
const found = new Set()
for (const match of kitCss.matchAll(interactivePattern)) found.add(`.${match[1]}`)

for (const selector of found) {
  // Modifier and element classes inherit their box from the base control.
  if (selector.includes('--') || selector.includes('__')) continue
  if (!declared.has(selector)) {
    violations.push(
      `${selector} is an interactive control in ${kitStylesheet} but is missing from the target-size contract`,
    )
  }
}

if (violations.length > 0) {
  console.error('Target size audit failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

const exceptionSummary = exceptions
  .map((exception) => `${exception.selector} via the ${exception.exception} exception`)
  .join(', ')

console.log(
  `Target size audit passed: ${targets.length} controls meet the ${MIN_TARGET_SIZE}px WCAG 2.2 minimum; ` +
    `${exceptions.length} documented exception (${exceptionSummary}).`,
)
