import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const failures = []

function source(relativePath) {
  const absolutePath = join(projectRoot, relativePath)
  if (!existsSync(absolutePath)) {
    failures.push(`${relativePath}: missing source file`)
    return ''
  }
  return readFileSync(absolutePath, 'utf8')
}

const foundations = source('src/ui/tokens/foundations.css')
const uiCss = source('src/ui/ui.css')
const appCss = source('src/styles/app.css')
const globalCss = source('src/styles/global.css')
const typography = source('src/lib/typography.ts')
const indexHtml = source('index.html')
const fontsCss = source('src/styles/fonts.css')
const mainTsx = source('src/main.tsx')
const guide = source('docs/TYPOGRAPHY_SYSTEM.md')

function requireMatch(text, pattern, message) {
  if (!pattern.test(text)) failures.push(message)
}

requireMatch(
  foundations,
  /--ui-font-sans:\s*"Onest",\s*sans-serif;/,
  'foundations: Onest sans token is missing',
)
requireMatch(
  foundations,
  /--ui-font-display:\s*"Onest",\s*sans-serif;/,
  'foundations: Onest display token is missing',
)
// Onest is self-hosted. A CDN source would disclose every launch to a third
// party and silently fall back to a system font whenever that host is slow,
// blocked or offline, discarding the semantic type scale without any error.
requireMatch(
  fontsCss,
  /@font-face\s*\{[^}]*font-family:\s*"Onest"/,
  'fonts.css: the self-hosted Onest @font-face declaration is missing',
)
requireMatch(
  mainTsx,
  /import '\.\/styles\/fonts\.css'/,
  'main.tsx: the self-hosted font stylesheet is not imported',
)
requireMatch(
  fontsCss,
  /font-weight:\s*100 900;/,
  'fonts.css: the variable weight axis no longer covers 100-900',
)
for (const subset of ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']) {
  requireMatch(
    fontsCss,
    new RegExp(`url\\("\\.\\./assets/fonts/onest-${subset}\\.woff2"\\)`),
    `fonts.css: the ${subset} subset is not declared`,
  )
  if (!existsSync(join(projectRoot, `src/assets/fonts/onest-${subset}.woff2`))) {
    failures.push(`src/assets/fonts: onest-${subset}.woff2 is missing`)
  }
}
if (/fonts\.(?:googleapis|gstatic)\.com/.test(indexHtml)) {
  failures.push('index.html: Onest must not be loaded from a third-party CDN')
}
if (/url\(\s*["']?https?:/.test(fontsCss)) {
  failures.push('fonts.css: font files must be served from this origin, not a remote URL')
}
requireMatch(
  typography,
  /export function keepRussianShortWords\s*\(/,
  'typography helper: keepRussianShortWords is missing',
)
for (const word of ['а', 'и', 'но', 'или']) {
  requireMatch(
    typography,
    new RegExp(`['"]${word}['"]`),
    `typography helper: conjunction ${word} is missing`,
  )
}
requireMatch(guide, /lowercase kebab-case/, 'typography guide: naming contract is missing')
requireMatch(guide, /Onest/, 'typography guide: typeface contract is missing')
requireMatch(guide, /keepRussianShortWords/, 'typography guide: wrapping contract is missing')

for (const weight of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
  requireMatch(
    foundations,
    new RegExp(`--ui-font-weight-${weight}:\\s*${weight};`),
    `foundations: numeric weight ${weight} is missing`,
  )
}

for (const role of ['display', 'title', 'heading', 'body', 'label', 'caption']) {
  requireMatch(
    uiCss,
    new RegExp(`\\.ui-type-${role}\\s*\\{`),
    `ui.css: semantic role ${role} is missing`,
  )
}

// Typography tokens are public design-system identifiers. Keep their names
// readable and deterministic; component BEM classes are intentionally outside
// this check because they are implementation selectors, not Figma styles.
for (const [file, text] of [['src/ui/tokens/foundations.css', foundations]]) {
  for (const match of text.matchAll(/(--ui-[\w-]+)\s*:/g)) {
    const name = match[1]
    if (!/^--ui-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      failures.push(`${file}: non-kebab typography token ${name}`)
    }
  }
}

// Product CSS may use the token or inherit the surrounding role, but must not
// introduce a competing font family. The only literal family is Onest with a
// generic sans-serif fallback.
for (const [file, text] of [
  ['src/ui/ui.css', uiCss],
  ['src/styles/app.css', appCss],
  ['src/styles/global.css', globalCss],
]) {
  for (const match of text.matchAll(/font-family\s*:\s*([^;]+);/gi)) {
    const value = match[1].trim().toLowerCase()
    if (value === 'inherit' || value.startsWith('var(--ui-font-')) continue
    if (value !== '"onest", sans-serif' && value !== "'onest', sans-serif") {
      failures.push(`${file}: competing font family ${match[1].trim()}`)
    }
  }
}

if (failures.length) {
  console.error(`Typography audit failed (${failures.length})`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  'Typography audit passed: Onest, numeric foundations, semantic roles, kebab-case names and Russian wrapping are configured.',
)
