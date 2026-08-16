import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  FIGMA_COLOR_SCOPES,
  aliasDescriptionOverrides,
  colorCollections,
  semanticHiddenFromPublishing,
  semanticPurpose,
  semanticScopes,
} from '../design-tokens/color-contract.mjs'

export const colorTokenFiles = Object.freeze({
  primitives: 'src/ui/tokens/color-primitives.css',
  aliases: 'src/ui/tokens/color-aliases.css',
  semantic: 'src/ui/tokens/color-semantic.css',
})

export const generatedColorFiles = Object.freeze({
  figma: 'design-tokens/generated/color-variables.figma.json',
  guide: 'docs/COLOR_SYSTEM.md',
})

const scopeDescriptions = Object.freeze({
  [FIGMA_COLOR_SCOPES.FRAME_FILL]:
    'Scope Figma: Frame — переменная показывается только для заливки Frame.',
  [FIGMA_COLOR_SCOPES.SHAPE_FILL]:
    'Scope Figma: Shape — переменная показывается только для заливки геометрических форм.',
  [FIGMA_COLOR_SCOPES.TEXT_FILL]:
    'Scope Figma: Text — переменная показывается только для заливки текста.',
  [FIGMA_COLOR_SCOPES.STROKE_COLOR]:
    'Scope Figma: Stroke — переменная показывается только для обводки.',
  [FIGMA_COLOR_SCOPES.EFFECT_COLOR]:
    'Scope Figma: Effects — переменная показывается только для цвета тени или другого эффекта.',
})

function parseDeclarations(file, source) {
  return [...source.matchAll(/^\s*(--color-[\w-]+)\s*:\s*([^;]+);/gm)].map(
    (match) => ({
      cssName: match[1],
      cssValue: match[2].trim(),
      source: file,
    }),
  )
}

function referenceFromValue(value) {
  const match = value.match(/^var\((--color-[\w-]+)\)$/)
  return match?.[1] ?? null
}

function tokenLayer(cssName) {
  if (cssName.startsWith('--color-primitive-')) return 'primitive'
  if (cssName.startsWith('--color-alias-illustration-')) return 'illustration-alias'
  if (cssName.startsWith('--color-alias-')) return 'alias'
  if (cssName.startsWith('--color-semantic-')) return 'semantic'
  throw new Error(`Unknown color token layer: ${cssName}`)
}

function collectionKeyForLayer(layer) {
  if (layer === 'primitive') return 'primitives'
  if (layer === 'semantic') return 'semantic'
  return 'aliases'
}

function figmaName(cssName, layer) {
  const prefix =
    layer === 'primitive'
      ? '--color-primitive-'
      : layer === 'semantic'
        ? '--color-semantic-'
        : '--color-alias-'
  return cssName.slice(prefix.length).replaceAll('-', '/')
}

function compactSemanticName(cssName) {
  return cssName.replace('--color-semantic-', '').replaceAll('-', '/')
}

function primitiveDescription(cssName) {
  const prefix = '--color-primitive-'
  const path = cssName.slice(prefix.length)
  const segments = path.split('-')
  const family = segments.shift()
  const role = segments.join(' ')
  if (!family || !role) throw new Error(`Cannot describe primitive ${cssName}`)

  if (family === 'alpha') {
    const alphaFamily = segments.shift()
    const alphaRole = segments.join(' ')
    return `Прозрачный примитив ${alphaFamily} с ролью «${alphaRole}». Имя описывает назначение и не является semantic-токеном. Только источник для alias-переменных; напрямую в макетах и компонентах не применять. Scope Figma отключён.`
  }

  return `Сырой оттенок палитры ${family} с ролью «${role}». Имя описывает визуальную интенсивность или техническое назначение, а не конкретный экран. Только источник для alias-переменных; напрямую в макетах и компонентах не применять. Scope Figma отключён.`
}

function aliasDescription(cssName, semanticConsumers) {
  const override = aliasDescriptionOverrides[cssName]
  const consumerText = semanticConsumers.length
    ? ` Питает semantic-роли: ${semanticConsumers.map(compactSemanticName).join(', ')}.`
    : ' Сейчас не имеет активного semantic-потребителя и считается зарезервированной промежуточной ролью.'
  const purpose = override ?? 'Промежуточное решение палитры между primitive и semantic слоями.'
  return `${purpose}${consumerText} Напрямую к макетам и компонентам не привязывать. Scope Figma отключён.`
}

function semanticScopeDescription(scopes) {
  if (scopes.length === 0) {
    return 'Scope Figma отключён: служебная переменная не должна появляться в property picker.'
  }
  if (
    scopes.length === 3 &&
    scopes.includes(FIGMA_COLOR_SCOPES.TEXT_FILL) &&
    scopes.includes(FIGMA_COLOR_SCOPES.SHAPE_FILL) &&
    scopes.includes(FIGMA_COLOR_SCOPES.STROKE_COLOR)
  ) {
    return 'Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола.'
  }
  return scopes.map((scope) => scopeDescriptions[scope]).join(' ')
}

function semanticDescription(cssName, scopes) {
  const purpose = semanticPurpose[cssName]

  if (!purpose) throw new Error(`Missing explicit semantic description for ${cssName}`)
  return `${purpose} ${semanticScopeDescription(scopes)}`
}

function resolveLiteral(cssName, byName, stack = []) {
  if (stack.includes(cssName)) {
    throw new Error(`Color token cycle: ${[...stack, cssName].join(' -> ')}`)
  }
  const token = byName.get(cssName)
  if (!token) throw new Error(`Unknown color token reference: ${cssName}`)
  const reference = referenceFromValue(token.cssValue)
  return reference ? resolveLiteral(reference, byName, [...stack, cssName]) : token.cssValue
}

function aliasValue(reference, byName) {
  const target = byName.get(reference)
  if (!target) throw new Error(`Unknown alias target: ${reference}`)
  const targetLayer = tokenLayer(reference)
  const collection = colorCollections[collectionKeyForLayer(targetLayer)]
  return {
    alias: {
      cssName: reference,
      collection: collection.name,
      name: figmaName(reference, targetLayer),
    },
  }
}

export function buildColorTokenModel(projectRoot) {
  const fileEntries = Object.values(colorTokenFiles).map((file) => [
    file,
    readFileSync(join(projectRoot, file), 'utf8'),
  ])
  const declarations = fileEntries.flatMap(([file, source]) => parseDeclarations(file, source))
  const byName = new Map()

  for (const declaration of declarations) {
    if (byName.has(declaration.cssName)) {
      throw new Error(`Duplicate color token: ${declaration.cssName}`)
    }
    byName.set(declaration.cssName, declaration)
  }

  const semanticConsumersByAlias = new Map()
  for (const declaration of declarations) {
    if (tokenLayer(declaration.cssName) !== 'semantic') continue
    const reference = referenceFromValue(declaration.cssValue)
    if (!reference) throw new Error(`Semantic token must alias another token: ${declaration.cssName}`)
    const consumers = semanticConsumersByAlias.get(reference) ?? []
    consumers.push(declaration.cssName)
    semanticConsumersByAlias.set(reference, consumers)
  }

  const variables = declarations.map((declaration) => {
    const { cssName, cssValue, source } = declaration
    const layer = tokenLayer(cssName)
    const collection = colorCollections[collectionKeyForLayer(layer)]
    const reference = referenceFromValue(cssValue)
    const scopes = layer === 'semantic' ? [...semanticScopes(cssName)] : []
    const hiddenFromPublishing =
      layer === 'semantic' ? semanticHiddenFromPublishing(cssName) : true
    const description =
      layer === 'primitive'
        ? primitiveDescription(cssName)
        : layer === 'alias'
            ? aliasDescription(cssName, semanticConsumersByAlias.get(cssName) ?? [])
            : semanticDescription(cssName, scopes)

    return {
      cssName,
      collection: collection.name,
      name: figmaName(cssName, layer),
      type: 'COLOR',
      layer,
      status:
        layer !== 'semantic' || hiddenFromPublishing
          ? 'internal'
          : 'active',
      source,
      codeSyntax: {
        WEB: `var(${cssName})`,
      },
      value: reference ? aliasValue(reference, byName) : cssValue,
      resolvedValue: resolveLiteral(cssName, byName),
      description,
      scopes,
      hiddenFromPublishing,
    }
  })

  const namesByCollection = new Set()
  for (const variable of variables) {
    const key = `${variable.collection}/${variable.name}`
    if (namesByCollection.has(key)) throw new Error(`Duplicate Figma variable path: ${key}`)
    namesByCollection.add(key)
  }

  return {
    schemaVersion: 1,
    purpose:
      'Figma-ready mirror of the production color system. CSS owns values; the contract owns meaning and picker scope.',
    scopeReference: {
      showInAllSupportedProperties: FIGMA_COLOR_SCOPES.ALL_SCOPES,
      fill: FIGMA_COLOR_SCOPES.ALL_FILLS,
      frame: FIGMA_COLOR_SCOPES.FRAME_FILL,
      shape: FIGMA_COLOR_SCOPES.SHAPE_FILL,
      text: FIGMA_COLOR_SCOPES.TEXT_FILL,
      stroke: FIGMA_COLOR_SCOPES.STROKE_COLOR,
      effects: FIGMA_COLOR_SCOPES.EFFECT_COLOR,
      rules: [
        'ALL_SCOPES is exclusive and cannot be combined with any other scope.',
        'ALL_FILLS already includes Frame, Shape and Text and cannot be combined with their individual fill scopes.',
        'scopes: [] hides the variable from property pickers without preventing programmatic binding.',
      ],
    },
    surfaceHierarchy: [
      {
        role: 'canvas',
        token: '--color-semantic-background-canvas',
        usage: 'Самый нижний фон приложения; на нём размещаются экраны и поверхности.',
      },
      {
        role: 'level-0',
        token: '--color-semantic-background-surface-level-0',
        usage: 'Базовые карточки, шторки, модальные экраны и обычные панели.',
      },
      {
        role: 'level-1',
        token: '--color-semantic-background-surface-level-1',
        usage: 'Первый вложенный уровень: input, subtle-контейнер и hover белого контрола.',
      },
      {
        role: 'level-2',
        token: '--color-semantic-background-surface-level-2',
        usage: 'Второй вложенный уровень: архив, badges, empty state и muted-контролы.',
      },
      {
        role: 'level-3',
        token: '--color-semantic-background-surface-level-3',
        usage: 'Самый глубокий тёплый inset-уровень: строки кодов и плотные локальные группы.',
      },
      {
        role: 'inverse',
        token: '--color-semantic-background-surface-inverse',
        usage: 'Тёмная поверхность для светлого foreground и медиа-контекста.',
      },
    ].map((surface) => ({
      ...surface,
      resolvedValue: resolveLiteral(surface.token, byName),
    })),
    collections: Object.values(colorCollections).map((collection) => ({
      ...collection,
      variables: variables.filter((variable) => variable.collection === collection.name),
    })),
  }
}

export function serializeColorTokenModel(model) {
  return `${JSON.stringify(model, null, 2)}\n`
}

function markdownEscape(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

export function renderColorSystemGuide(model) {
  const semanticCollection = model.collections.find(
    (collection) => collection.name === colorCollections.semantic.name,
  )
  const scopeRows = [
    ['Text', 'TEXT_FILL', 'Только заливка текста'],
    ['Icon', 'SHAPE_FILL + STROKE_COLOR', 'Fill- и stroke-иконки'],
    ['Background', 'FRAME_FILL', 'Только заливка Frame'],
    ['Border', 'STROKE_COLOR', 'Только обводка'],
    ['Button foreground', 'TEXT_FILL + SHAPE_FILL + STROKE_COLOR', 'Label и обе разновидности иконок внутри одного контрола'],
    ['Shape', 'SHAPE_FILL', 'Только геометрическая форма'],
    ['Overlay', 'FRAME_FILL', 'Overlay в системе всегда строится Frame'],
    ['Shadow / Effect', 'EFFECT_COLOR', 'Только цвет эффекта'],
    ['Primitive / Alias / Platform internal', '—', 'Scope отключён; в picker не показывается'],
  ]

  const lines = [
    '# Color system',
    '',
    '## Source of truth',
    '',
    '- Значения цветов: CSS-файлы в `src/ui/tokens/`.',
    '- Назначение, Figma Scope и публикация: `design-tokens/color-contract.mjs`.',
    '- Контраст реальных foreground/background пар: `design-tokens/color-contrast-contract.mjs`.',
    '- Методика и проверенные коэффициенты: `docs/COLOR_CONTRAST.md`.',
    '- Полный Figma-ready реестр: `design-tokens/generated/color-variables.figma.json`.',
    '- Продуктовый UI использует только semantic-токены. Primitive и alias всегда служебные.',
    '- Для Dev Mode каждая переменная хранит WEB code syntax в формате `var(--color-...)`.',
    '',
    '## Layers',
    '',
    '1. `color-primitives` — сырые значения палитры; Scope отключён, коллекция скрыта.',
    '2. `color-alias` — промежуточные решения палитры и единая точка смены цвета; Scope отключён, коллекция скрыта.',
    '3. `color-semantic` — продуктовые роли с точным Scope; это единственная публичная коллекция.',
    '',
    'Имена непрозрачных примитивов описывают оттенок и роль (`blue/faint`, `neutral/heading`, `rose/brand`), а не требуют запоминать шкалу 100/200. Имена `alpha/*` также используют понятные роли (`alpha/black/subtle`, `alpha/red/focus`). Точные значения остаются внутренней реализацией primitive-слоя.',
    '',
    '## Surface hierarchy',
    '',
    '| Уровень | Значение | Использование |',
    '| --- | --- | --- |',
    ...model.surfaceHierarchy.map(
      (surface) =>
        `| ${surface.role} | \`${surface.resolvedValue}\` | ${markdownEscape(surface.usage)} |`,
    ),
    '',
    'Правило вложенности: `canvas → level-0 → level-1 → level-2 → level-3`. Следующий уровень используется только внутри предыдущего и должен обозначать реальную группировку, а не декоративную полоску. `inverse` — отдельная тёмная ветка для медиа.',
    '',
    '## Figma Scope matrix',
    '',
    '| Семантическая группа | Scope | Где показывать |',
    '| --- | --- | --- |',
    ...scopeRows.map((row) => `| ${row[0]} | \`${row[1]}\` | ${row[2]} |`),
    '',
    '`ALL_SCOPES` является эксклюзивным. `ALL_FILLS` уже включает Frame, Shape и Text и не комбинируется с отдельными fill-scopes. Пустой массив Scope скрывает переменную из property picker.',
    '',
    '## Semantic variables',
    '',
    'У каждой переменной ниже полное назначение также записано в поле `description` Figma-ready реестра.',
    '',
    '| Variable | Value | Scope | Description |',
    '| --- | --- | --- | --- |',
    ...semanticCollection.variables.map(
      (variable) =>
        `| \`${variable.name}\` | \`${variable.resolvedValue}\` | \`${variable.scopes.join(' + ') || 'hidden'}\` | ${markdownEscape(variable.description)} |`,
    ),
    '',
    '## Enforcement',
    '',
    '- Новый semantic-токен без явного назначения или Scope ломает `npm run audit:colors`.',
    '- Недостаточный контраст текста, функциональной иконки, границы или состояния ломает `npm run audit:contrast:strict` и production build.',
    '- Изменение CSS-токенов без обновления Figma-ready реестра также ломает аудит.',
    '- Компаниям принадлежат цвета их логотипов; SVG-логотипы не являются палитрой приложения и остаются документированными исключениями.',
    '- Технические цвета иллюстраций хранятся отдельно в коде, проходят аудит и намеренно не попадают в дизайнерскую палитру Figma.',
  ]

  return `${lines.join('\n')}\n`
}
