import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildSpacingTokenModel,
  generatedSpacingFiles,
  serializeSpacingTokenModel,
} from './spacing-token-model.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const model = buildSpacingTokenModel(projectRoot)
const output = join(projectRoot, generatedSpacingFiles.figma)

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, serializeSpacingTokenModel(model))
console.log(`Wrote ${generatedSpacingFiles.figma}`)
