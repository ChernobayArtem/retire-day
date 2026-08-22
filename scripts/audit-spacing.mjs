import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FIGMA_SPACING_SCOPE, spacingCollections } from '../design-tokens/spacing-contract.mjs'
import {
  buildSpacingTokenModel,
  generatedSpacingFiles,
  serializeSpacingTokenModel,
  spacingTokenFiles,
} from './spacing-token-model.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tokenFiles = new Set(Object.values(spacingTokenFiles))
const issues = []

function normalizePath(path) {
  return relative(projectRoot, path).split(sep).join('/')
}

function addIssue(kind, file, index, message) {
  const content = existsSync(join(projectRoot, file))
    ? readFileSync(join(projectRoot, file), 'utf8')
    : ''
  const before = content.slice(0, Math.max(0, index))
  const line = before.split('\n').length
  issues.push({ kind, file, line, message })
}

function visitDirectory(directory, files) {
  if (!existsSync(directory)) return

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry)
    const relativePath = normalizePath(absolutePath)
    if (entry === 'node_modules' || entry === 'dist') continue

    if (statSync(absolutePath).isDirectory()) {
      visitDirectory(absolutePath, files)
      continue
    }

    if (/\.(?:css|ts|tsx|js|jsx|mjs)$/u.test(entry)) files.push(relativePath)
  }
}

function auditNoInternalLayerConsumption() {
  const sourceFiles = []
  visitDirectory(join(projectRoot, 'src'), sourceFiles)

  for (const file of sourceFiles) {
    if (tokenFiles.has(file)) continue
    const content = readFileSync(join(projectRoot, file), 'utf8')
    const matches = [...content.matchAll(/var\(\s*(--spacing-(?:primitive|alias)-[\w-]+)/g)]
    for (const match of matches) {
      addIssue(
        'token layer',
        file,
        match.index + match[0].indexOf(match[1]),
        `Product UI must consume semantic spacing tokens, not ${match[1]}.`,
      )
    }

    const legacyMatches = [
      ...content.matchAll(/--ui-(?:space-[\w-]+|layout-gutter|button-icon-gap)\b/g),
    ]
    for (const match of legacyMatches) {
      addIssue(
        'legacy spacing proxy',
        file,
        match.index,
        `${match[0]} bypasses the public --spacing-semantic-* contract.`,
      )
    }
  }
}

function auditRawProductSpacing() {
  const cssFiles = ['src/styles/app.css', 'src/ui/ui.css']
  const propertyPattern =
    /^\s*(?:margin|padding|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?\s*:\s*([^;]*\b-?\d+(?:\.\d+)?px[^;]*);/gm

  for (const file of cssFiles) {
    const content = readFileSync(join(projectRoot, file), 'utf8')
    const lines = content.split('\n')
    for (const match of content.matchAll(propertyPattern)) {
      const value = match[1]
      const rawValues = [...value.matchAll(/-?\d+(?:\.\d+)?px/g)].map((item) => item[0])
      const isSemanticCancellation =
        rawValues.every((item) => item === '0px') && value.includes('var(--spacing-semantic-')
      if (isSemanticCancellation) continue

      const line = content.slice(0, match.index).split('\n').length
      const nearby = lines.slice(Math.max(0, line - 4), line - 1).join('\n')
      if (!nearby.includes('layout-exception:')) {
        issues.push({
          kind: 'raw product spacing',
          file,
          line,
          message:
            'Use an existing --spacing-semantic-* role, or add an adjacent layout-exception comment for intentional art/media/safe-area geometry.',
        })
      }
    }
  }
}

function auditModelMetadata(model) {
  const collectionsByName = new Map(
    model.collections.map((collection) => [collection.name, collection]),
  )

  for (const expected of Object.values(spacingCollections)) {
    const collection = collectionsByName.get(expected.name)
    if (!collection) {
      issues.push({
        kind: 'collection',
        file: 'design-tokens/spacing-contract.mjs',
        line: 1,
        message: `Missing Figma collection ${expected.name}.`,
      })
      continue
    }

    if (JSON.stringify(collection.modes) !== JSON.stringify(['Value'])) {
      issues.push({
        kind: 'collection mode',
        file: 'design-tokens/spacing-contract.mjs',
        line: 1,
        message: `${expected.name} must expose exactly one Value mode.`,
      })
    }
    if (collection.hiddenFromPublishing !== expected.hiddenFromPublishing) {
      issues.push({
        kind: 'collection publication',
        file: 'design-tokens/spacing-contract.mjs',
        line: 1,
        message: `${expected.name} has an incorrect hidden/public state.`,
      })
    }
  }

  for (const collection of model.collections) {
    for (const variable of collection.variables) {
      const expectedScopes = variable.layer === 'semantic' ? [FIGMA_SPACING_SCOPE] : []
      const expectedHidden = variable.layer !== 'semantic'
      const expectedPrefix = `--spacing-${variable.layer}-`

      if (!variable.cssName.startsWith(expectedPrefix)) {
        issues.push({
          kind: 'hierarchy',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must use the ${expectedPrefix} prefix.`,
        })
      }
      if (variable.type !== 'FLOAT') {
        issues.push({
          kind: 'type',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must be a Figma FLOAT variable.`,
        })
      }
      if (variable.mode !== 'Value') {
        issues.push({
          kind: 'mode',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must use the Value mode.`,
        })
      }
      if (variable.codeSyntax?.WEB !== `var(${variable.cssName})`) {
        issues.push({
          kind: 'code syntax',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must expose WEB syntax var(${variable.cssName}).`,
        })
      }
      if (!variable.description?.trim()) {
        issues.push({
          kind: 'description',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} is missing its Russian Figma description.`,
        })
      }
      if (JSON.stringify(variable.scopes) !== JSON.stringify(expectedScopes)) {
        issues.push({
          kind: 'scope',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must use scopes ${JSON.stringify(expectedScopes)}.`,
        })
      }
      if (variable.hiddenFromPublishing !== expectedHidden) {
        issues.push({
          kind: 'publication',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} has an incorrect hidden/public state.`,
        })
      }

      if (variable.layer === 'primitive' && typeof variable.value !== 'number') {
        issues.push({
          kind: 'hierarchy',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must hold a literal number.`,
        })
      }
      if (
        variable.layer === 'alias' &&
        !variable.value?.alias?.cssName?.startsWith('--spacing-primitive-')
      ) {
        issues.push({
          kind: 'hierarchy',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must alias a primitive spacing token.`,
        })
      }
      if (
        variable.layer === 'semantic' &&
        !variable.value?.alias?.cssName?.startsWith('--spacing-alias-')
      ) {
        issues.push({
          kind: 'hierarchy',
          file: variable.source,
          line: 1,
          message: `${variable.cssName} must alias an alias spacing token.`,
        })
      }
    }
  }
}

function auditNoOrphanedInternalTokens(model) {
  const variables = model.collections.flatMap((collection) => collection.variables)
  const aliasesConsumedBySemantic = new Set(
    variables
      .filter((variable) => variable.layer === 'semantic')
      .map((variable) => variable.value.alias.cssName),
  )
  const primitivesConsumedByAlias = new Set(
    variables
      .filter((variable) => variable.layer === 'alias')
      .map((variable) => variable.value.alias.cssName),
  )

  for (const variable of variables) {
    if (variable.layer === 'alias' && !aliasesConsumedBySemantic.has(variable.cssName)) {
      issues.push({
        kind: 'orphan alias',
        file: variable.source,
        line: 1,
        message: `${variable.cssName} does not feed a semantic spacing role. Remove it or add its reusable semantic consumer.`,
      })
    }
    if (variable.layer === 'primitive' && !primitivesConsumedByAlias.has(variable.cssName)) {
      issues.push({
        kind: 'orphan primitive',
        file: variable.source,
        line: 1,
        message: `${variable.cssName} does not feed an alias spacing role. Remove it or add its reusable alias consumer.`,
      })
    }
  }
}

function auditGeneratedArtifact(model) {
  const artifact = join(projectRoot, generatedSpacingFiles.figma)
  if (!existsSync(artifact)) {
    issues.push({
      kind: 'generated artifact',
      file: generatedSpacingFiles.figma,
      line: 1,
      message: 'Missing generated Figma spacing registry. Run npm run tokens:spacing.',
    })
    return
  }

  const actual = readFileSync(artifact, 'utf8')
  const expected = serializeSpacingTokenModel(model)
  if (actual !== expected) {
    issues.push({
      kind: 'generated artifact',
      file: generatedSpacingFiles.figma,
      line: 1,
      message:
        'Generated spacing registry is stale. Run npm run tokens:spacing and review the diff.',
    })
  }
}

let model
try {
  model = buildSpacingTokenModel(projectRoot)
} catch (error) {
  issues.push({
    kind: 'contract',
    file: 'design-tokens/spacing-contract.mjs',
    line: 1,
    message: error instanceof Error ? error.message : String(error),
  })
}

if (model) {
  auditModelMetadata(model)
  auditNoOrphanedInternalTokens(model)
  auditGeneratedArtifact(model)
}
auditNoInternalLayerConsumption()
auditRawProductSpacing()

if (issues.length) {
  console.error(`Spacing audit failed with ${issues.length} issue(s):`)
  for (const issue of issues) {
    console.error(`- [${issue.kind}] ${issue.file}:${issue.line} ${issue.message}`)
  }
  process.exitCode = 1
} else {
  const count = model.collections.reduce(
    (total, collection) => total + collection.variables.length,
    0,
  )
  console.log(`Spacing audit passed: ${count} variables across 3 layers.`)
}
