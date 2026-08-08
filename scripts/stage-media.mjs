// Раскладывает перечисленные в secretMedia подготовленные файлы из media-src/
// в public/ перед шифрованием.
//
// Зачем: `npm run encrypt` переиспользует контент-ключ из secret/cek.json и
// заново собирает манифест, а плейнтекст из public/ удаляет. Значит любая правка
// контента требует, чтобы ВСЕ файлы из secretMedia снова лежали в public/.
// Если хотя бы одного файла не хватает, encrypt.mjs остановит сборку до записи
// нового vault, чтобы не опубликовать неполный манифест.
//
// Важно: копируем не всё дерево media-src/, а только явный allowlist. Поэтому
// забытый локальный файл не сможет случайно остаться плейнтекстом в public/.
// media-src/ (gitignored) — канонические, уже обработанные файлы: повёрнутые
// по EXIF, сжатые, без метаданных.
import { copyFile, lstat, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'media-src')
const dest = path.join(root, 'public')
const { secretMedia } = await import(path.join(root, 'secret/content.mjs'))

if (!existsSync(src)) {
  console.error('media-src/ не найдена — нечего раскладывать.')
  process.exit(1)
}

function resolveInside(base, relativePath) {
  if (
    typeof relativePath !== 'string' ||
    relativePath.length === 0 ||
    relativePath.includes('\\') ||
    path.posix.isAbsolute(relativePath) ||
    path.posix.normalize(relativePath) !== relativePath
  ) {
    throw new Error('secretMedia содержит небезопасный путь.')
  }

  const resolved = path.resolve(base, relativePath)
  const prefix = `${path.resolve(base)}${path.sep}`
  if (!resolved.startsWith(prefix)) throw new Error('secretMedia выходит за пределы media-src/public.')
  return resolved
}

if (!Array.isArray(secretMedia) || new Set(secretMedia).size !== secretMedia.length) {
  throw new Error('secretMedia должен быть массивом уникальных путей.')
}

for (const rel of secretMedia) {
  const file = resolveInside(src, rel)
  const target = resolveInside(dest, rel)
  let info
  try {
    info = await lstat(file)
  } catch {
    throw new Error('Не найден один из файлов, перечисленных в secretMedia.')
  }
  if (!info.isFile() || info.isSymbolicLink()) {
    throw new Error('secretMedia должен ссылаться только на обычные файлы.')
  }
  await mkdir(path.dirname(target), { recursive: true })
  await copyFile(file, target)
}
console.log(`staged ${secretMedia.length} allowlisted files from media-src/ → public/`)
