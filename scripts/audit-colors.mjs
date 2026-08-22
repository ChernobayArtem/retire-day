import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FIGMA_COLOR_SCOPES } from '../design-tokens/color-contract.mjs'
import {
  buildColorTokenModel,
  generatedColorFiles,
  renderColorSystemGuide,
  serializeColorTokenModel,
} from './color-token-model.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const primitiveFile = 'src/ui/tokens/color-primitives.css'
const primitiveFiles = [primitiveFile, 'src/ui/tokens/color-illustration-primitives.css']
const aliasFiles = [
  'src/ui/tokens/color-aliases.css',
  'src/ui/tokens/color-illustration-aliases.css',
]
const semanticFile = 'src/ui/tokens/color-semantic.css'
const tokenFiles = new Set([...primitiveFiles, ...aliasFiles, semanticFile])

// These files are original company marks. Their official brand colors are assets,
// not application palette values, so they intentionally stay outside our tokens.
const brandAssetExceptions = new Set([
  'public/art/golden-apple.svg',
  'public/art/lamoda.svg',
  'public/art/ozon.svg',
  'public/art/wb.svg',
])

const illustrationConsumers = new Set([
  'src/components/Day29Confetti.tsx',
  'src/components/PostFinale.tsx',
])

const sourceExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
])

const cssNamedColors = new Set(
  `
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond
  blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue
  cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey
  darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon
  darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
  deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen
  fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
  hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon
  lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey
  lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
  lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine
  mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen
  mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite
  navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen
  paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell
  sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan
  teal thistle tomato transparent turquoise violet wheat white whitesmoke yellow
  yellowgreen
`
    .trim()
    .split(/\s+/),
)

const issues = []

function normalizePath(path) {
  return relative(projectRoot, path).split(sep).join('/')
}

function addIssue(kind, file, index, message) {
  const content = fileContents.get(file) ?? ''
  const before = content.slice(0, Math.max(0, index))
  const line = before.split('\n').length
  const lastLineBreak = before.lastIndexOf('\n')
  const column = index - lastLineBreak
  issues.push({ kind, file, line, column, message })
}

function visitDirectory(directory, files) {
  if (!existsSync(directory)) return

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry)
    const relativePath = normalizePath(absolutePath)

    if (
      relativePath === 'dist' ||
      relativePath.startsWith('dist/') ||
      relativePath === 'node_modules' ||
      relativePath.startsWith('node_modules/') ||
      relativePath === 'public/vault' ||
      relativePath.startsWith('public/vault/')
    ) {
      continue
    }

    if (statSync(absolutePath).isDirectory()) {
      visitDirectory(absolutePath, files)
      continue
    }

    if (sourceExtensions.has(extname(entry).toLowerCase())) files.push(relativePath)
  }
}

function collectFiles() {
  const files = []
  visitDirectory(join(projectRoot, 'src'), files)
  visitDirectory(join(projectRoot, 'public'), files)

  for (const file of ['index.html', 'vite.config.ts', 'local-content/current/content.mjs']) {
    if (existsSync(join(projectRoot, file))) files.push(file)
  }

  return [...new Set(files)].filter((file) => !brandAssetExceptions.has(file)).sort()
}

const files = collectFiles()
const fileContents = new Map(
  files.map((file) => [file, readFileSync(join(projectRoot, file), 'utf8')]),
)

function matchesOf(content, pattern) {
  return [...content.matchAll(pattern)]
}

function auditRawColorLiterals(file, content) {
  if (primitiveFiles.includes(file)) return

  for (const match of matchesOf(
    content,
    /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})(?![\da-f\w-])/gi,
  )) {
    addIssue('raw color', file, match.index, `Move ${match[0]} to color-primitives.css.`)
  }

  for (const match of matchesOf(
    content,
    /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(\s*[^)]*\)/gi,
  )) {
    addIssue('raw color', file, match.index, `Move ${match[0]} to color-primitives.css.`)
  }

  // Named colors need syntactic context to avoid treating ordinary copy or class
  // names as palette values. CSS declarations and exact JS/JSX string values cover
  // the color-bearing forms used by this application.
  const colorProperty = String.raw`(?:--[\w-]+|color|background(?:-color)?|border(?:-[\w-]+)?|outline(?:-color)?|box-shadow|text-shadow|fill|stroke|stop-color|flood-color|caret-color|accent-color|text-decoration(?:-color)?|column-rule(?:-color)?)`
  const declarationPattern = new RegExp(`${colorProperty}\\s*:\\s*([^;{}\\n]+)`, 'gi')

  for (const match of matchesOf(content, declarationPattern)) {
    const value = match[1]
    const valueOffset = match.index + match[0].indexOf(value)
    for (const word of value.matchAll(/(?<![-\w])([a-z]+)(?![-\w])/gi)) {
      if (cssNamedColors.has(word[1].toLowerCase())) {
        addIssue(
          'raw color',
          file,
          valueOffset + word.index,
          `Replace named color ${word[1]} with a token.`,
        )
      }
    }
  }

  for (const match of matchesOf(content, /(["'`])([a-z]+)\1/gi)) {
    if (cssNamedColors.has(match[2].toLowerCase())) {
      addIssue('raw color', file, match.index + 1, `Replace named color ${match[2]} with a token.`)
    }
  }
}

function parseDeclarations(file) {
  const content = fileContents.get(file) ?? ''
  return matchesOf(content, /^\s*(--[\w-]+)\s*:\s*([^;]+);/gm).map((match) => ({
    name: match[1],
    value: match[2].trim(),
    index: match.index + match[0].indexOf(match[1]),
  }))
}

function parseVarReferences(content) {
  return matchesOf(content, /var\(\s*(--[\w-]+)/g).map((match) => ({
    name: match[1],
    index: match.index + match[0].indexOf(match[1]),
  }))
}

function auditTokenHierarchy() {
  const primitives = primitiveFiles.flatMap((file) =>
    parseDeclarations(file).map((declaration) => ({ ...declaration, file })),
  )

  for (const declaration of primitives) {
    const expectedPrefix =
      declaration.file === primitiveFile ? '--color-primitive-' : '--color-illustration-primitive-'
    if (!declaration.name.startsWith(expectedPrefix)) {
      addIssue(
        'token hierarchy',
        declaration.file,
        declaration.index,
        `${declaration.name} must use the ${expectedPrefix} prefix.`,
      )
    }
    if (/var\(/.test(declaration.value)) {
      addIssue(
        'token hierarchy',
        declaration.file,
        declaration.index,
        `${declaration.name} must hold a literal color, not another token.`,
      )
    }
  }

  for (const file of primitiveFiles) {
    const primitiveContent = fileContents.get(file) ?? ''
    for (const reference of parseVarReferences(primitiveContent)) {
      addIssue(
        'token hierarchy',
        file,
        reference.index,
        `Primitive tokens cannot reference ${reference.name}.`,
      )
    }
  }

  for (const file of aliasFiles) {
    const content = fileContents.get(file) ?? ''
    const expectedPrimitivePrefix = file.endsWith('color-illustration-aliases.css')
      ? '--color-illustration-primitive-'
      : '--color-primitive-'
    for (const declaration of parseDeclarations(file)) {
      if (!declaration.name.startsWith('--color-alias-')) {
        addIssue(
          'token hierarchy',
          file,
          declaration.index,
          `${declaration.name} must use the --color-alias- prefix.`,
        )
      }
      if (
        !declaration.value.startsWith(`var(${expectedPrimitivePrefix}`) ||
        !declaration.value.endsWith(')')
      ) {
        addIssue(
          'token hierarchy',
          file,
          declaration.index,
          `${declaration.name} must reference exactly one primitive token.`,
        )
      }
    }
    for (const reference of parseVarReferences(content)) {
      if (!reference.name.startsWith(expectedPrimitivePrefix)) {
        addIssue(
          'token hierarchy',
          file,
          reference.index,
          `Alias files may reference primitives only; found ${reference.name}.`,
        )
      }
    }
  }

  const semanticContent = fileContents.get(semanticFile) ?? ''
  for (const declaration of parseDeclarations(semanticFile)) {
    if (!declaration.name.startsWith('--color-semantic-')) {
      addIssue(
        'token hierarchy',
        semanticFile,
        declaration.index,
        `${declaration.name} must use the --color-semantic- prefix.`,
      )
    }
    if (!/^var\(--color-alias-[\w-]+\)$/.test(declaration.value)) {
      addIssue(
        'token hierarchy',
        semanticFile,
        declaration.index,
        `${declaration.name} must reference exactly one alias token.`,
      )
    }
  }
  for (const reference of parseVarReferences(semanticContent)) {
    if (!reference.name.startsWith('--color-alias-')) {
      addIssue(
        'token hierarchy',
        semanticFile,
        reference.index,
        `Semantic tokens may reference aliases only; found ${reference.name}.`,
      )
    }
  }
}

function isIllustrationConsumer(file) {
  return file.startsWith('src/scenes/') || illustrationConsumers.has(file)
}

function auditLayerConsumption() {
  for (const [file, content] of fileContents) {
    if (tokenFiles.has(file)) continue

    for (const reference of parseVarReferences(content)) {
      if (
        reference.name.startsWith('--color-primitive-') ||
        reference.name.startsWith('--color-illustration-primitive-')
      ) {
        addIssue(
          'token layer',
          file,
          reference.index,
          `Application code must consume semantic tokens, not ${reference.name}.`,
        )
        continue
      }

      if (!reference.name.startsWith('--color-alias-')) continue

      const allowedIllustration =
        isIllustrationConsumer(file) && reference.name.startsWith('--color-alias-illustration-')
      if (!allowedIllustration) {
        addIssue(
          'token layer',
          file,
          reference.index,
          `Application code must consume semantic tokens, not ${reference.name}.`,
        )
      }
    }
  }
}

function collectRuntimeDefinitions(file, content) {
  const definitions = []
  const patterns = [
    /(?:^|[;{\n])\s*(--[\w-]+)\s*:/g,
    /["'](--[\w-]+)["']\s*:/g,
    /\[\s*["'](--[\w-]+)["'](?:\s+as\s+string)?\s*\]\s*:/g,
    /\.setProperty\(\s*["'](--[\w-]+)["']/g,
  ]

  for (const pattern of patterns) {
    for (const match of matchesOf(content, pattern)) definitions.push(match[1])
  }

  return definitions
}

function auditReferences() {
  const definitions = new Map()

  for (const [file, content] of fileContents) {
    for (const name of collectRuntimeDefinitions(file, content)) {
      if (!definitions.has(name)) definitions.set(name, file)
    }
  }

  const colorDefinitions = new Map()
  for (const file of tokenFiles) {
    for (const declaration of parseDeclarations(file)) {
      const previousFile = colorDefinitions.get(declaration.name)
      if (previousFile) {
        addIssue(
          'duplicate token',
          file,
          declaration.index,
          `${declaration.name} is already defined in ${previousFile}.`,
        )
      } else {
        colorDefinitions.set(declaration.name, file)
      }
    }
  }

  for (const [file, content] of fileContents) {
    for (const reference of parseVarReferences(content)) {
      if (!definitions.has(reference.name)) {
        addIssue(
          'undefined variable',
          file,
          reference.index,
          `${reference.name} is referenced but never defined.`,
        )
      }
    }
  }
}

function auditFigmaMetadata() {
  let model
  try {
    model = buildColorTokenModel(projectRoot)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    addIssue('figma metadata', semanticFile, 0, message)
    return
  }

  const allowedScopes = new Set(Object.values(FIGMA_COLOR_SCOPES))
  for (const collection of model.collections) {
    for (const variable of collection.variables) {
      if (!variable.description || variable.description.trim().length < 60) {
        addIssue(
          'figma metadata',
          variable.source,
          0,
          `${variable.cssName} needs a clear description of at least 60 characters.`,
        )
      }

      if (variable.codeSyntax?.WEB !== `var(${variable.cssName})`) {
        addIssue(
          'figma metadata',
          variable.source,
          0,
          `${variable.cssName} must expose WEB code syntax as var(${variable.cssName}).`,
        )
      }

      for (const scope of variable.scopes) {
        if (!allowedScopes.has(scope)) {
          addIssue(
            'figma metadata',
            variable.source,
            0,
            `${variable.cssName} uses unsupported Figma scope ${scope}.`,
          )
        }
      }

      if (variable.scopes.includes(FIGMA_COLOR_SCOPES.ALL_SCOPES) && variable.scopes.length !== 1) {
        addIssue(
          'figma metadata',
          variable.source,
          0,
          `${variable.cssName}: ALL_SCOPES must be exclusive.`,
        )
      }

      const individualFillScopes = [
        FIGMA_COLOR_SCOPES.FRAME_FILL,
        FIGMA_COLOR_SCOPES.SHAPE_FILL,
        FIGMA_COLOR_SCOPES.TEXT_FILL,
      ]
      if (
        variable.scopes.includes(FIGMA_COLOR_SCOPES.ALL_FILLS) &&
        individualFillScopes.some((scope) => variable.scopes.includes(scope))
      ) {
        addIssue(
          'figma metadata',
          variable.source,
          0,
          `${variable.cssName}: ALL_FILLS cannot be combined with Frame, Shape, or Text fill.`,
        )
      }

      if (variable.layer !== 'semantic') {
        if (variable.scopes.length > 0 || !variable.hiddenFromPublishing) {
          addIssue(
            'figma metadata',
            variable.source,
            0,
            `${variable.cssName} is internal and must have scopes: [] plus hiddenFromPublishing: true.`,
          )
        }
      } else if (!variable.hiddenFromPublishing && variable.scopes.length === 0) {
        addIssue(
          'figma metadata',
          variable.source,
          0,
          `${variable.cssName} is public but hidden from every Figma property picker.`,
        )
      }
    }
  }

  const expectedOutputs = [
    [generatedColorFiles.figma, serializeColorTokenModel(model)],
    [generatedColorFiles.guide, renderColorSystemGuide(model)],
  ]
  for (const [file, expected] of expectedOutputs) {
    const absolutePath = join(projectRoot, file)
    if (!existsSync(absolutePath)) {
      addIssue('figma metadata', file, 0, `Run npm run tokens:colors to generate ${file}.`)
      continue
    }
    const actual = readFileSync(absolutePath, 'utf8')
    if (actual !== expected) {
      addIssue(
        'figma metadata',
        file,
        0,
        `${file} is stale. Run npm run tokens:colors and commit the result.`,
      )
    }
  }
}

for (const [file, content] of fileContents) auditRawColorLiterals(file, content)
auditTokenHierarchy()
auditLayerConsumption()
auditReferences()
auditFigmaMetadata()

issues.sort(
  (a, b) =>
    a.kind.localeCompare(b.kind) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column,
)

if (issues.length > 0) {
  console.error(
    `Color token audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`,
  )
  let previousKind = ''
  for (const issue of issues) {
    if (issue.kind !== previousKind) {
      previousKind = issue.kind
      console.error(`\n${issue.kind}:`)
    }
    console.error(`  ${issue.file}:${issue.line}:${issue.column}  ${issue.message}`)
  }
  process.exitCode = 1
} else {
  const tokenCount = [...tokenFiles].reduce(
    (count, file) => count + parseDeclarations(file).length,
    0,
  )
  console.log(
    `Color token audit passed: ${files.length} files checked, ${tokenCount} color tokens validated.`,
  )
}
