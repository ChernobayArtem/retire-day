import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  FIGMA_SPACING_SCOPE,
  spacingAliasDefinitions,
  spacingCollections,
  spacingDefinitionLayers,
  spacingPrimitiveDefinitions,
  spacingSemanticDefinitions,
} from '../design-tokens/spacing-contract.mjs'

export const spacingTokenFiles = Object.freeze({
  primitives: 'src/ui/tokens/spacing-primitives.css',
  aliases: 'src/ui/tokens/spacing-aliases.css',
  semantic: 'src/ui/tokens/spacing-semantic.css',
})

export const generatedSpacingFiles = Object.freeze({
  figma: 'design-tokens/generated/spacing-variables.figma.json',
})

const collectionForLayer = Object.freeze({
  primitive: spacingCollections.primitives,
  alias: spacingCollections.aliases,
  semantic: spacingCollections.semantic,
})

const definitionsForLayer = Object.freeze({
  primitive: spacingPrimitiveDefinitions,
  alias: spacingAliasDefinitions,
  semantic: spacingSemanticDefinitions,
})

function parseDeclarations(file, source) {
  return [...source.matchAll(/^\s*(--spacing-[\w-]+)\s*:\s*([^;]+);/gm)].map((match) => ({
    cssName: match[1],
    cssValue: match[2].trim(),
    source: file,
  }))
}

function referenceFromValue(value) {
  const match = value.match(/^var\((--spacing-[\w-]+)\)$/)
  return match?.[1] ?? null
}

function layerForCssName(cssName) {
  if (cssName.startsWith('--spacing-primitive-')) return 'primitive'
  if (cssName.startsWith('--spacing-alias-')) return 'alias'
  if (cssName.startsWith('--spacing-semantic-')) return 'semantic'
  throw new Error(`Unknown spacing token layer: ${cssName}`)
}

function numericValue(cssValue, cssName) {
  if (cssValue === '0') return 0
  const match = cssValue.match(/^(\d+(?:\.\d+)?)px$/)
  if (!match) throw new Error(`${cssName} must resolve to a px value or 0, received ${cssValue}`)
  return Number(match[1])
}

function definitionsByName(layer) {
  return new Map(definitionsForLayer[layer].map((definition) => [definition.cssName, definition]))
}

function assertLayerMatchesContract(layer, declarations) {
  const expectedByName = definitionsByName(layer)
  const actualByName = new Map(
    declarations.map((declaration) => [declaration.cssName, declaration]),
  )

  if (actualByName.size !== declarations.length) {
    throw new Error(`Duplicate ${layer} spacing token declaration.`)
  }

  for (const definition of expectedByName.values()) {
    const actual = actualByName.get(definition.cssName)
    if (!actual) throw new Error(`Missing ${layer} spacing token: ${definition.cssName}`)

    const expectedValue = layer === 'primitive' ? definition.value : `var(${definition.target})`
    if (actual.cssValue !== expectedValue) {
      throw new Error(
        `${definition.cssName} must equal ${expectedValue}, received ${actual.cssValue}`,
      )
    }
  }

  for (const actual of actualByName.values()) {
    if (!expectedByName.has(actual.cssName)) {
      throw new Error(`Undocumented ${layer} spacing token: ${actual.cssName}`)
    }
  }
}

function semanticConsumersByAlias() {
  const consumers = new Map()
  for (const definition of spacingSemanticDefinitions) {
    const current = consumers.get(definition.target) ?? []
    current.push(definition)
    consumers.set(definition.target, current)
  }
  return consumers
}

function aliasDescription(definition, consumers) {
  const consumerNames = (consumers.get(definition.cssName) ?? []).map((consumer) => consumer.name)
  const targets = consumerNames.length
    ? ` Питает semantic-роли: ${consumerNames.join(', ')}.`
    : ' Пока не имеет semantic-потребителя и зарезервирована для будущей роли.'
  return `${definition.purpose}${targets} Напрямую к макетам и компонентам не привязывать. Scope Figma отключён.`
}

function semanticDescription(definition) {
  return `${definition.purpose} Scope Figma: GAP — переменная доступна только для расстояний, padding и auto-layout gap. Не применять как размер иконки, радиус или типографический размер.`
}

function aliasValue(reference, byName) {
  const target = byName.get(reference)
  if (!target) throw new Error(`Unknown spacing token reference: ${reference}`)
  const targetLayer = layerForCssName(reference)
  const targetDefinition = definitionsByName(targetLayer).get(reference)
  return {
    alias: {
      cssName: reference,
      collection: collectionForLayer[targetLayer].name,
      name: targetDefinition.name,
    },
  }
}

function resolveNumericValue(cssName, byName, stack = []) {
  if (stack.includes(cssName)) {
    throw new Error(`Spacing token cycle: ${[...stack, cssName].join(' -> ')}`)
  }

  const token = byName.get(cssName)
  if (!token) throw new Error(`Unknown spacing token: ${cssName}`)
  const reference = referenceFromValue(token.cssValue)
  return reference
    ? resolveNumericValue(reference, byName, [...stack, cssName])
    : numericValue(token.cssValue, cssName)
}

function definitionFor(cssName, layer) {
  const definition = definitionsByName(layer).get(cssName)
  if (!definition) throw new Error(`Missing contract metadata for ${cssName}`)
  return definition
}

export function buildSpacingTokenModel(projectRoot) {
  const entries = Object.entries(spacingTokenFiles).map(([layer, file]) => ({
    layer: layer === 'primitives' ? 'primitive' : layer === 'aliases' ? 'alias' : 'semantic',
    file,
    source: readFileSync(join(projectRoot, file), 'utf8'),
  }))
  const declarations = entries.flatMap(({ layer, file, source }) =>
    parseDeclarations(file, source).map((declaration) => ({ ...declaration, layer })),
  )
  const byName = new Map()

  for (const declaration of declarations) {
    if (byName.has(declaration.cssName)) {
      throw new Error(`Duplicate spacing token: ${declaration.cssName}`)
    }
    byName.set(declaration.cssName, declaration)
  }

  for (const layer of Object.keys(spacingDefinitionLayers)) {
    assertLayerMatchesContract(
      layer,
      declarations.filter((declaration) => declaration.layer === layer),
    )
  }

  const consumers = semanticConsumersByAlias()
  const variables = declarations.map((declaration) => {
    const { cssName, cssValue, source, layer } = declaration
    const definition = definitionFor(cssName, layer)
    const collection = collectionForLayer[layer]
    const reference = referenceFromValue(cssValue)
    const scopes = layer === 'semantic' ? [FIGMA_SPACING_SCOPE] : []
    const description =
      layer === 'primitive'
        ? definition.description
        : layer === 'alias'
          ? aliasDescription(definition, consumers)
          : semanticDescription(definition)

    return {
      cssName,
      collection: collection.name,
      name: definition.name,
      type: 'FLOAT',
      layer,
      status: layer === 'semantic' ? 'active' : 'internal',
      mode: 'Value',
      source,
      codeSyntax: {
        WEB: `var(${cssName})`,
      },
      value: reference ? aliasValue(reference, byName) : numericValue(cssValue, cssName),
      resolvedValue: resolveNumericValue(cssName, byName),
      description,
      scopes,
      hiddenFromPublishing: collection.hiddenFromPublishing,
    }
  })

  const namesByCollection = new Set()
  for (const variable of variables) {
    const key = `${variable.collection}/${variable.name}`
    if (namesByCollection.has(key)) throw new Error(`Duplicate Figma spacing variable path: ${key}`)
    namesByCollection.add(key)
  }

  return {
    schemaVersion: 1,
    purpose:
      'Figma-ready mirror of the compact production spacing system. CSS owns values; this contract owns meaning, picker scope and publication.',
    scopeReference: {
      gap: FIGMA_SPACING_SCOPE,
      rules: [
        'Spacing variables are FLOAT values with one Value mode.',
        'Primitive and alias variables use scopes: [] and stay hidden from publishing.',
        'Semantic variables use scopes: ["GAP"] so they appear only for auto-layout gaps and padding.',
        'Product components consume semantic variables only; primitive and alias layers are internal.',
      ],
    },
    proximityRules: [
      {
        relationship: 'same-thought',
        token: '--spacing-semantic-content-text-gap',
        guidance:
          'Связанные текстовые строки и label/value живут ближе друг к другу, чем соседние блоки.',
      },
      {
        relationship: 'same-control',
        token: '--spacing-semantic-control-icon-gap',
        guidance: 'Иконка и label одного control составляют неделимую пару.',
      },
      {
        relationship: 'same-group',
        token: '--spacing-semantic-layout-content-gap',
        guidance: 'Элементы одной content-группы разделяются равномерным stack-gap.',
      },
      {
        relationship: 'adjacent-blocks',
        token: '--spacing-semantic-layout-block-gap',
        guidance: 'Близкие блоки остаются одной смысловой группой, но не слипаются.',
      },
      {
        relationship: 'separate-sections',
        token: '--spacing-semantic-layout-section-gap',
        guidance:
          'Самостоятельные разделы получают заметно больше воздуха, чем внутренности группы.',
      },
    ],
    collections: Object.values(spacingCollections).map((collection) => ({
      ...collection,
      variables: variables.filter((variable) => variable.collection === collection.name),
    })),
  }
}

export function serializeSpacingTokenModel(model) {
  return `${JSON.stringify(model, null, 2)}\n`
}
