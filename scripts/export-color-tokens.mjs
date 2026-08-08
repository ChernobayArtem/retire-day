import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildColorTokenModel,
  generatedColorFiles,
  renderColorSystemGuide,
  serializeColorTokenModel,
} from './color-token-model.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const model = buildColorTokenModel(projectRoot)
const outputs = [
  [generatedColorFiles.figma, serializeColorTokenModel(model)],
  [generatedColorFiles.guide, renderColorSystemGuide(model)],
]

for (const [relativePath, content] of outputs) {
  const absolutePath = join(projectRoot, relativePath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content)
  console.log(`Wrote ${relativePath}`)
}
