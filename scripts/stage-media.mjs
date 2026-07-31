// Раскладывает подготовленные картинки из media-src/ в public/ перед шифрованием.
//
// Зачем: `npm run encrypt` генерирует НОВЫЙ контент-ключ и собирает манифест с
// нуля, а плейнтекст из public/ удаляет. Значит любая правка контента требует,
// чтобы ВСЕ картинки из secretMedia снова лежали в public/ — иначе они молча
// выпадут из манифеста и соответствующие дни сломаются.
//
// media-src/ (gitignored) — канонические, уже обработанные файлы: повёрнутые
// по EXIF, сжатые, без метаданных. Здесь только копирование.
import { cp, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'media-src')
const dest = path.join(root, 'public')

if (!existsSync(src)) {
  console.error('media-src/ не найдена — нечего раскладывать.')
  process.exit(1)
}

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (e.name !== '.DS_Store') out.push(p)
  }
  return out
}

const files = await walk(src)
for (const file of files) {
  const rel = path.relative(src, file)
  const target = path.join(dest, rel)
  await mkdir(path.dirname(target), { recursive: true })
  await cp(file, target)
}
console.log(`staged ${files.length} files from media-src/ → public/`)
