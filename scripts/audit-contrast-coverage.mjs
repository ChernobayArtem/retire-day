import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  contrastExemptions,
  contrastPairs,
} from '../design-tokens/color-contrast-contract.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const json = process.argv.includes('--json')

const sourceExtensions = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx'])
const colorDefinitionFiles = new Set([
  'src/ui/tokens/color-primitives.css',
  'src/ui/tokens/color-aliases.css',
  'src/ui/tokens/color-illustration-aliases.css',
  'src/ui/tokens/color-semantic.css',
])

function normalizePath(path) {
  return relative(projectRoot, path).split(sep).join('/')
}

function collectSourceFiles(directory, files = []) {
  if (!existsSync(directory)) return files

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry)
    const relativePath = normalizePath(absolutePath)

    if (statSync(absolutePath).isDirectory()) {
      collectSourceFiles(absolutePath, files)
      continue
    }

    if (
      sourceExtensions.has(extname(entry).toLowerCase()) &&
      !colorDefinitionFiles.has(relativePath)
    ) {
      files.push(relativePath)
    }
  }

  return files
}

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
}

function maskCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, ' '),
  )
}

function contrastCategory(token) {
  if (token.startsWith('--color-semantic-text-')) return 'text'
  if (token.startsWith('--color-semantic-icon-')) return 'icon'
  if (/^--color-semantic-button-.+-foreground$/.test(token)) return 'control-foreground'
  if (/^--color-semantic-button-.+-border(?:-hover)?$/.test(token)) return 'control-boundary'
  if (token.startsWith('--color-semantic-border-')) return 'boundary'
  if (token.startsWith('--color-semantic-shape-')) return 'shape'
  if (token === '--color-semantic-effect-focus-ring') return 'focus'
  return null
}

function selectorAt(source, index) {
  const openBrace = source.lastIndexOf('{', index)
  if (openBrace < 0) return null
  const previousBoundary = Math.max(
    source.lastIndexOf('}', openBrace - 1),
    source.lastIndexOf('{', openBrace - 1),
  )
  const selector = source
    .slice(previousBoundary + 1, openBrace)
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/\s+/gu, ' ')
    .trim()
  return selector || null
}

function normalizeSelector(selector) {
  return selector.replace(/\s+/gu, ' ').trim()
}

function collectConsumers() {
  const consumers = new Map()

  for (const file of collectSourceFiles(join(projectRoot, 'src')).sort()) {
    const source = readFileSync(join(projectRoot, file), 'utf8')
    const searchableSource = extname(file).toLowerCase() === '.css'
      ? maskCssComments(source)
      : source
    for (const match of searchableSource.matchAll(/var\(\s*(--color-semantic-[\w-]+)/g)) {
      const token = match[1]
      const category = contrastCategory(token)
      if (!category) continue

      const references = consumers.get(token) ?? { category, locations: [] }
      references.locations.push({
        file,
        line: lineAt(source, match.index),
        selector: file.endsWith('.css') ? selectorAt(source, match.index) : null,
      })
      consumers.set(token, references)
    }
  }

  return consumers
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function exemptionPatternMatches(token, pattern) {
  const range = pattern.match(/^(.*?)(\d+)…(\d+)$/)
  if (range) {
    const [, prefix, first, last] = range
    const tokenRange = token.match(new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`))
    if (!tokenRange) return false
    const value = Number(tokenRange[1])
    return value >= Number(first) && value <= Number(last)
  }

  if (pattern.includes('*')) {
    const expression = pattern
      .split('*')
      .map(escapeRegExp)
      .join('.*')
    return new RegExp(`^${expression}$`).test(token)
  }

  return token === pattern
}

const consumers = collectConsumers()
const requiredTokens = new Set(
  contrastPairs.map((pair) => pair.foreground?.token).filter(Boolean),
)
const exemptionEntries = contrastExemptions.flatMap((exemption) =>
  (exemption.tokens ?? []).map((pattern) => ({
    id: exemption.id,
    pattern,
    selectors: (exemption.selectors ?? []).map(normalizeSelector),
    files: exemption.files ?? [],
  })),
)

function exemptionAllowsLocation(exemption, location) {
  if (exemption.files.includes(location.file)) return true
  if (!location.selector) return false
  const actualSelectors = normalizeSelector(location.selector)
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean)
  return actualSelectors.every((actual) =>
    exemption.selectors.some(
      (allowed) =>
        actual === allowed ||
        actual.startsWith(`${allowed}:`) ||
        actual.startsWith(`${allowed}[`) ||
        actual.startsWith(`${allowed}.`) ||
        actual.startsWith(`${allowed} `),
    ),
  )
}

const results = [...consumers.entries()]
  .map(([token, consumer]) => {
    const exemption = exemptionEntries.find(
      (entry) =>
        exemptionPatternMatches(token, entry.pattern) &&
        consumer.locations.every((location) => exemptionAllowsLocation(entry, location)),
    )
    const status = requiredTokens.has(token)
      ? 'required'
      : exemption
        ? 'exempt'
        : 'missing'

    return {
      token,
      category: consumer.category,
      status,
      exemption: exemption?.id ?? null,
      locations: consumer.locations,
    }
  })
  .sort((left, right) => left.token.localeCompare(right.token))

const missing = results.filter((result) => result.status === 'missing')
const report = {
  scope:
    'Consumed semantic text, icon, control-foreground, boundary, and focus token roles.',
  note:
    'This is a token-role coverage audit. Numeric contrast remains the responsibility of audit-color-contrast.mjs.',
  totals: {
    consumed: results.length,
    required: results.filter((result) => result.status === 'required').length,
    exempt: results.filter((result) => result.status === 'exempt').length,
    missing: missing.length,
  },
  results,
}

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  const status = missing.length ? 'FAILED' : 'PASSED'
  console.log(
    `Contrast coverage audit ${status}: ${report.totals.consumed} consumed roles; ` +
      `${report.totals.required} required; ${report.totals.exempt} documented exemptions; ` +
      `${report.totals.missing} missing.`,
  )

  for (const result of missing) {
    const locations = result.locations
      .slice(0, 3)
      .map(({ file, line }) => `${file}:${line}`)
      .join(', ')
    console.log(`MISSING\t${result.category}\t${result.token}\t${locations}`)
  }
}

if (missing.length) process.exitCode = 1
