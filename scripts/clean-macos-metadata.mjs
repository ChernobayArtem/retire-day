#!/usr/bin/env node

// Finder may recreate .DS_Store in public/ or dist/, where it would become an
// unintended deploy artifact. Remove only this known metadata filename while
// leaving project and user content untouched.
import { lstat, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const skippedDirectories = new Set(['.git', 'node_modules'])
let removed = 0

async function clean(directory) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.name === '.DS_Store') {
      const info = await lstat(target)
      if (info.isFile() && !info.isSymbolicLink()) {
        await rm(target)
        removed += 1
      }
      continue
    }
    if (entry.isDirectory() && !skippedDirectories.has(entry.name)) await clean(target)
  }
}

await clean(root)
console.log(`macOS metadata cleanup: ${removed} file(s) removed`)
