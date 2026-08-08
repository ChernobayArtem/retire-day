import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const primitiveFile = 'src/ui/tokens/color-primitives.css'
const aliasFiles = [
  'src/ui/tokens/color-aliases.css',
  'src/ui/tokens/color-illustration-aliases.css',
]
const semanticFile = 'src/ui/tokens/color-semantic.css'
const tokenFiles = new Set([primitiveFile, ...aliasFiles, semanticFile])

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

const cssNamedColors = new Set(`
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
`.trim().split(/\s+/))

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

  for (const file of ['index.html', 'vite.config.ts', 'secret/content.mjs']) {
    if (existsSync(join(projectRoot, file))) files.push(file)
  }

  return [...new Set(files)]
    .filter((file) => !brandAssetExceptions.has(file))
    .sort()
}

const files = collectFiles()
const fileContents = new Map(
  files.map((file) => [file, readFileSync(join(projectRoot, file), 'utf8')]),
)

function matchesOf(content, pattern) {
  return [...content.matchAll(pattern)]
}

function auditRawColorLiterals(file, content) {
  if (file === primitiveFile) return

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
      addIssue(
        'raw color',
        file,
        match.index + 1,
        `Replace named color ${match[2]} with a token.`,
      )
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
  const primitives = parseDeclarations(primitiveFile)
  const primitiveContent = fileContents.get(primitiveFile) ?? ''

  for (const declaration of primitives) {
    if (!declaration.name.startsWith('--color-primitive-')) {
      addIssue(
        'token hierarchy',
        primitiveFile,
        declaration.index,
        `${declaration.name} must use the --color-primitive- prefix.`,
      )
    }
    if (/var\(/.test(declaration.value)) {
      addIssue(
        'token hierarchy',
        primitiveFile,
        declaration.index,
        `${declaration.name} must hold a literal color, not another token.`,
      )
    }
  }

  for (const reference of parseVarReferences(primitiveContent)) {
    addIssue(
      'token hierarchy',
      primitiveFile,
      reference.index,
      `Primitive tokens cannot reference ${reference.name}.`,
    )
  }

  for (const file of aliasFiles) {
    const content = fileContents.get(file) ?? ''
    for (const declaration of parseDeclarations(file)) {
      if (!declaration.name.startsWith('--color-alias-')) {
        addIssue(
          'token hierarchy',
          file,
          declaration.index,
          `${declaration.name} must use the --color-alias- prefix.`,
        )
      }
      if (!/^var\(--color-primitive-[\w-]+\)$/.test(declaration.value)) {
        addIssue(
          'token hierarchy',
          file,
          declaration.index,
          `${declaration.name} must reference exactly one primitive token.`,
        )
      }
    }
    for (const reference of parseVarReferences(content)) {
      if (!reference.name.startsWith('--color-primitive-')) {
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
      if (reference.name.startsWith('--color-primitive-')) {
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
        isIllustrationConsumer(file) &&
        reference.name.startsWith('--color-alias-illustration-')
      const allowedDayAccent =
        file === 'secret/content.mjs' &&
        reference.name.startsWith('--color-alias-day-accent-')

      if (!allowedIllustration && !allowedDayAccent) {
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

for (const [file, content] of fileContents) auditRawColorLiterals(file, content)
auditTokenHierarchy()
auditLayerConsumption()
auditReferences()

issues.sort(
  (a, b) =>
    a.kind.localeCompare(b.kind) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column,
)

if (issues.length > 0) {
  console.error(`Color token audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`)
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
  console.log(`Color token audit passed: ${files.length} files checked, ${tokenCount} color tokens validated.`)
}
