import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CONTRAST_MINIMUM,
  accessibleValues,
  contrastExemptions,
  contrastPairs,
} from '../design-tokens/color-contrast-contract.mjs'
import { buildColorTokenModel } from './color-token-model.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const strict = process.argv.includes('--strict')
const json = process.argv.includes('--json')
const EPSILON = 0.005

function parseColor(value) {
  const input = value.trim().toLowerCase()
  if (input === 'transparent') return [0, 0, 0, 0]

  if (input.startsWith('#')) {
    let hex = input.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      hex = [...hex].map((character) => character + character).join('')
    }
    if (hex.length !== 6 && hex.length !== 8) throw new Error(`Unsupported hex color: ${value}`)
    const channels = [0, 2, 4].map(
      (index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255,
    )
    const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
    return [...channels, alpha]
  }

  const functional = input.match(/^rgba?\(([^)]+)\)$/)
  if (!functional) throw new Error(`Unsupported color syntax: ${value}`)
  const channels = functional[1].split(',').map((part) => Number(part.trim()))
  if (channels.length !== 3 && channels.length !== 4) {
    throw new Error(`Unsupported color channel count: ${value}`)
  }
  return [channels[0] / 255, channels[1] / 255, channels[2] / 255, channels[3] ?? 1]
}

function composite(foreground, background) {
  const alpha = foreground[3] + background[3] * (1 - foreground[3])
  if (alpha === 0) return [0, 0, 0, 0]
  return [
    (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) / alpha,
    (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) / alpha,
    (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) / alpha,
    alpha,
  ]
}

function opaque(color, fallback = [1, 1, 1, 1]) {
  return color[3] < 1 ? composite(color, fallback) : color
}

function relativeLuminance(color) {
  return color.slice(0, 3).reduce((sum, channel, index) => {
    const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    return sum + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  )
}

function referenceColor(reference, valuesByToken) {
  const value = reference.token ? valuesByToken.get(reference.token) : reference.literal
  if (!value) throw new Error(`Unknown contrast token: ${reference.token}`)
  const parsed = parseColor(value)
  parsed[3] *= reference.opacity ?? 1
  return parsed
}

function evaluatePair(pair, valuesByToken) {
  if (!CONTRAST_MINIMUM[pair.kind])
    throw new Error(`Unknown contrast kind in ${pair.id}: ${pair.kind}`)
  if (!pair.backgroundLayers?.length) throw new Error(`No background layers in ${pair.id}`)

  let background = [1, 1, 1, 1]
  for (const layer of pair.backgroundLayers) {
    background = composite(referenceColor(layer, valuesByToken), background)
  }
  background = opaque(background)
  const foreground = opaque(referenceColor(pair.foreground, valuesByToken), background)
  const ratio = contrastRatio(foreground, background)
  const minimum = CONTRAST_MINIMUM[pair.kind]
  const standardPass = ratio + EPSILON >= minimum

  return {
    id: pair.id,
    selectors: pair.selectors,
    kind: pair.kind,
    enforcement: pair.enforcement,
    ratio: Number(ratio.toFixed(3)),
    minimum,
    standardPass,
    note: pair.note ?? null,
  }
}

const model = buildColorTokenModel(projectRoot)
const valuesByToken = new Map(
  model.collections.flatMap((collection) =>
    collection.variables.map((variable) => [variable.cssName, variable.resolvedValue]),
  ),
)

for (const [cssName, expectedValue] of Object.entries(accessibleValues)) {
  const actualValue = valuesByToken.get(cssName)
  if (!actualValue)
    throw new Error(`Accessible color contract references an unknown token: ${cssName}`)
  const actual = parseColor(actualValue)
  const expected = parseColor(expectedValue)
  const matches = actual.every((channel, index) => Math.abs(channel - expected[index]) <= 1 / 510)
  if (!matches) {
    throw new Error(
      `Accessible color value drifted for ${cssName}: expected ${expectedValue}, received ${actualValue}`,
    )
  }
}

const ids = new Set()
for (const pair of contrastPairs) {
  if (ids.has(pair.id)) throw new Error(`Duplicate contrast pair id: ${pair.id}`)
  ids.add(pair.id)
  if (pair.enforcement !== 'required') {
    throw new Error(`Unsupported enforcement in ${pair.id}: ${pair.enforcement}`)
  }
}
for (const exemption of contrastExemptions) {
  if (ids.has(exemption.id)) throw new Error(`Duplicate contrast/exemption id: ${exemption.id}`)
  ids.add(exemption.id)
  if (!exemption.reason?.trim()) throw new Error(`Missing exemption reason: ${exemption.id}`)
}

const results = contrastPairs.map((pair) => evaluatePair(pair, valuesByToken))
const standardFailures = results.filter((result) => !result.standardPass)
const fatal = standardFailures

const report = {
  standard: 'WCAG 2.2 AA',
  mode: strict ? 'strict' : 'standard',
  totals: {
    pairs: results.length,
    pass: results.length - standardFailures.length,
    failures: standardFailures.length,
    exemptions: contrastExemptions.length,
  },
  results,
  exemptions: contrastExemptions,
  accessibleValues,
}

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  const status = fatal.length ? 'FAILED' : 'PASSED'
  console.log(
    `Color contrast audit ${status}: ${report.totals.pass}/${report.totals.pairs} pairs meet WCAG 2.2 AA; ` +
      `${report.totals.failures} failures; ${report.totals.exemptions} documented exemption groups.`,
  )
  for (const result of standardFailures) {
    console.log(`FAIL\t${result.id}\t${result.ratio}:1 < ${result.minimum}:1\t${result.kind}`)
  }
}

if (fatal.length) process.exitCode = 1
