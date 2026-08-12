import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const sourceRoot = path.join(root, 'src')
const inlineSvgAllowlist = new Set([
  'src/ui/Icons.tsx',
  'src/components/Orchid.tsx',
  'src/components/PostFinale.tsx',
])

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectFiles(target)
    return entry.isFile() && target.endsWith('.tsx') ? [target] : []
  }))
  return nested.flat()
}

const violations = []
const files = await collectFiles(sourceRoot)

for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join('/')
  const source = await readFile(file, 'utf8')
  const isDecorativeScene = relative.startsWith('src/scenes/')
  const allowsInlineSvg = inlineSvgAllowlist.has(relative) || isDecorativeScene

  if (!allowsInlineSvg && /<(?:svg|path)\b/.test(source)) {
    violations.push(`${relative}: inline SVG outside the canonical icon registry`)
  }

  if (!allowsInlineSvg && /[‹›✕✖✓✔⬇⇩▶⏵◀]/.test(source)) {
    violations.push(`${relative}: Unicode pictogram used instead of the canonical icon registry`)
  }

  if (/material-symbols|fonts\.googleapis\.com\/icon/i.test(source)) {
    violations.push(`${relative}: runtime icon font/CDN dependency is not allowed`)
  }
}

if (violations.length > 0) {
  console.error('Icon system audit failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log(`Icon system audit passed: ${files.length} TSX files checked; system SVGs are centralized in src/ui/Icons.tsx.`)
