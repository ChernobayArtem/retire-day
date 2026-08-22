export const FIGMA_COLOR_SCOPES = Object.freeze({
  ALL_SCOPES: 'ALL_SCOPES',
  ALL_FILLS: 'ALL_FILLS',
  FRAME_FILL: 'FRAME_FILL',
  SHAPE_FILL: 'SHAPE_FILL',
  TEXT_FILL: 'TEXT_FILL',
  STROKE_COLOR: 'STROKE_COLOR',
  EFFECT_COLOR: 'EFFECT_COLOR',
})

export const colorCollections = Object.freeze({
  primitives: {
    name: 'color-primitives',
    description:
      'Сырые значения палитры с читаемыми lowercase kebab-case именами: blue/faint, neutral/heading, rose/brand и alpha/black/subtle. Название описывает роль оттенка, а не заставляет выбирать между непрозрачными шагами 100/200. Служебная коллекция: переменные из неё нельзя применять напрямую к макетам или компонентам.',
    hiddenFromPublishing: true,
  },
  aliases: {
    name: 'color-alias',
    description:
      'Промежуточные решения палитры. Здесь меняется соответствие продуктовой роли и примитива; напрямую к макетам не привязывается.',
    hiddenFromPublishing: true,
  },
  semantic: {
    name: 'color-semantic',
    description:
      'Публичные цвета дизайн-системы. Только эту коллекцию дизайнер выбирает в Figma; Scope каждой переменной ограничивает допустимое свойство.',
    hiddenFromPublishing: false,
  },
})

export const aliasDescriptionOverrides = Object.freeze({
  '--color-alias-surface-canvas':
    'Самый нижний фон приложения. Не использовать для карточек, шторок или вложенных контейнеров.',
  '--color-alias-surface-level-0':
    'Surface Level 0. Базовая поверхность карточек, шторок, модальных экранов и обычных панелей поверх canvas.',
  '--color-alias-surface-level-1':
    'Surface Level 1. Первый уровень вложенности: поля ввода, слегка отделённые контейнеры и hover белых контролов.',
  '--color-alias-surface-level-2':
    'Surface Level 2. Второй уровень вложенности: фон архива, badges, empty state и приглушённые ghost-контролы.',
  '--color-alias-surface-level-3':
    'Surface Level 3. Самый глубокий тёплый inset-уровень: строки кодов и локальные сгруппированные области.',
  '--color-alias-surface-inverse':
    'Инверсная тёмная поверхность для полноэкранного медиа и контента, которому нужен светлый foreground.',
})

export const semanticPurpose = Object.freeze({
  '--color-semantic-text-primary':
    'Основной текст интерфейса, значения полей и обычный читаемый контент.',
  '--color-semantic-text-heading':
    'Заголовки экранов, шторок, карточек и крупных смысловых разделов.',
  '--color-semantic-text-secondary':
    'Поясняющий текст средней важности, подписи, даты и метаинформация.',
  '--color-semantic-text-muted':
    'Приглушённый вспомогательный текст, который не конкурирует с основным содержанием.',
  '--color-semantic-text-disabled':
    'Текст недоступного состояния; не применять для обычного вторичного текста.',
  '--color-semantic-text-inverse': 'Светлый текст на тёмной, цветной или медиа-поверхности.',
  '--color-semantic-text-brand':
    'Функциональный брендовый акцент в тексте: активное или текущее состояние.',
  '--color-semantic-text-action': 'Текст утилитарного действия, например копирования или возврата.',
  '--color-semantic-text-danger':
    'Текст ошибки или опасного состояния; не использовать декоративно.',
  '--color-semantic-icon-primary': 'Основные системные иконки на светлой поверхности.',
  '--color-semantic-icon-muted': 'Второстепенные иконки и неактивные графические маркеры.',
  '--color-semantic-icon-inverse':
    'Светлые системные иконки на тёмной, цветной или медиа-поверхности.',
  '--color-semantic-icon-brand':
    'Функциональные брендовые иконки активного или текущего состояния.',
  '--color-semantic-icon-danger': 'Иконки ошибки или потенциально опасного действия.',
  '--color-semantic-background-canvas':
    'Корневой canvas приложения; самый нижний фон всего экрана.',
  '--color-semantic-background-surface-level-0':
    'Surface Level 0: карточки, шторки, модальные экраны и панели поверх canvas.',
  '--color-semantic-background-surface-level-1':
    'Surface Level 1: первый вложенный слой, input или hover светлого контрола.',
  '--color-semantic-background-surface-level-2':
    'Surface Level 2: второй вложенный слой, архив, badge или empty state.',
  '--color-semantic-background-surface-level-3':
    'Surface Level 3: глубокий inset-слой для строк кодов и плотных локальных групп.',
  '--color-semantic-background-surface-inverse':
    'Тёмная инверсная поверхность для светлого foreground и медиа-контекста.',
  '--color-semantic-background-brand-page':
    'Мягкий брендовый фон полноэкранного служебного состояния, например просьбы повернуть устройство.',
  '--color-semantic-background-brand-subtle':
    'Мягкая брендовая заливка выбранного или эмоционально выделенного блока.',
  '--color-semantic-background-brand-faint':
    'Едва заметная брендовая заливка компактного текущего состояния.',
  '--color-semantic-background-danger-subtle':
    'Слабая заливка ошибки или предупреждения без потери читаемости.',
  '--color-semantic-background-media': 'Базовая тёмная поверхность вокруг фото или видео.',
  '--color-semantic-background-media-placeholder':
    'Нейтральная область до появления или расшифровки медиа.',
  '--color-semantic-background-message':
    'Заливка синего сообщения, его хвоста и связанных реакций.',
  '--color-semantic-background-skeleton': 'Базовая заливка состояния загрузки и skeleton-элемента.',
  '--color-semantic-background-tooltip': 'Фон информационной подсказки поверх интерфейса.',
  '--color-semantic-background-transparent':
    'Прозрачная заливка, сохраняющая геометрию и hit area контрола.',
  '--color-semantic-border-default':
    'Стандартная функциональная обводка кнопки, поля или контейнера.',
  '--color-semantic-border-progress-connector':
    'Линия-коннектор между подписью процента и шкалой прогресса.',
  '--color-semantic-border-subtle':
    'Слабая декоративная граница между соседними светлыми поверхностями.',
  '--color-semantic-border-brand':
    'Брендовая обводка активного, текущего или сфокусированного элемента.',
  '--color-semantic-border-brand-strong':
    'Усиленная брендовая обводка выбранного таба или акцентной поверхности.',
  '--color-semantic-border-danger':
    'Обводка ошибки, опасного состояния или предупреждающей карточки.',
  '--color-semantic-border-inverse-subtle': 'Слабая светлая обводка контрола поверх тёмного медиа.',
  '--color-semantic-border-inverse-strong':
    'Контрастная светлая обводка loader или активного медиа-контрола.',
  '--color-semantic-border-transparent':
    'Прозрачная обводка, сохраняющая геометрию между состояниями.',
  '--color-semantic-button-outline-background': 'Фон обычной светлой outline-кнопки.',
  '--color-semantic-button-outline-background-hover':
    'Фон светлой outline-кнопки при наведении указателя.',
  '--color-semantic-button-outline-border':
    'Обводка светлой outline-кнопки во всех обычных состояниях.',
  '--color-semantic-button-outline-foreground': 'Текст и системная иконка светлой outline-кнопки.',
  '--color-semantic-button-primary-background': 'Фон главной брендовой кнопки в обычном состоянии.',
  '--color-semantic-button-primary-background-hover':
    'Фон главной брендовой кнопки при hover или pressed.',
  '--color-semantic-button-primary-border': 'Обводка главной брендовой кнопки в обычном состоянии.',
  '--color-semantic-button-primary-border-hover':
    'Обводка главной брендовой кнопки при hover или pressed.',
  '--color-semantic-button-primary-foreground':
    'Текст и системная иконка главной брендовой кнопки.',
  '--color-semantic-button-soft-background': 'Мягкий брендовый фон вторичной кнопки или badge.',
  '--color-semantic-button-soft-background-hover':
    'Мягкий брендовый фон вторичной кнопки при наведении.',
  '--color-semantic-button-soft-foreground': 'Текст и системная иконка мягкой брендовой кнопки.',
  '--color-semantic-button-action-background':
    'Мягкий фон утилитарного действия, например копирования.',
  '--color-semantic-button-action-background-hover':
    'Мягкий фон утилитарного действия при наведении.',
  '--color-semantic-button-action-foreground': 'Текст и системная иконка утилитарного действия.',
  '--color-semantic-button-disabled-background': 'Фон недоступной кнопки или иконки-кнопки.',
  '--color-semantic-button-disabled-foreground': 'Текст и системная иконка недоступной кнопки.',
  '--color-semantic-shape-divider': 'Заливка геометрической линии Divider; это shape, а не stroke.',
  '--color-semantic-shape-carousel-active': 'Активная точка пагинации фотокарусели.',
  '--color-semantic-shape-carousel-inactive': 'Неактивная точка пагинации фотокарусели.',
  '--color-semantic-shape-message-tail': 'Треугольный хвост синего пузыря сообщения.',
  '--color-semantic-shape-tooltip-pointer': 'Треугольный хвост tooltip, совпадающий с его фоном.',
  '--color-semantic-shape-brand-soft':
    'Мягкая брендовая форма внутри служебной иллюстрации интерфейса.',
  '--color-semantic-content-accent-compliment':
    'Акцент категории «Комплимент» независимо от номера и длины календаря.',
  '--color-semantic-content-accent-photos':
    'Акцент категории «Фотографии» независимо от номера и длины календаря.',
  '--color-semantic-content-accent-certificate':
    'Акцент категории «Сертификат» независимо от номера и длины календаря.',
  '--color-semantic-content-accent-coupon':
    'Акцент категории «Купон» независимо от номера и длины календаря.',
  '--color-semantic-content-accent-restaurant':
    'Акцент категории «Ресторан» независимо от номера и длины календаря.',
  '--color-semantic-content-accent-video':
    'Акцент категории «Видео» независимо от номера и длины календаря.',
  '--color-semantic-overlay-sheet': 'Затемнение основного экрана под открытой шторкой дня.',
  '--color-semantic-overlay-media-soft': 'Слабое затемнение поверх медиапостера или фотографии.',
  '--color-semantic-overlay-media-medium':
    'Среднее затемнение между светлым и сильным stop градиента медиапостера.',
  '--color-semantic-overlay-media-strong':
    'Сильное затемнение поверх медиапостера для читаемого foreground.',
  '--color-semantic-overlay-control': 'Полупрозрачный тёмный фон контрола поверх фото или видео.',
  '--color-semantic-overlay-control-strong':
    'Усиленный тёмный фон важной плашки поверх фото или видео.',
  '--color-semantic-overlay-fullscreen': 'Почти непрозрачный фон полноэкранного просмотра медиа.',
  '--color-semantic-overlay-glass':
    'Светлая стеклянная заливка компактного контрола поверх контента.',
  '--color-semantic-overlay-glass-strong':
    'Более плотная стеклянная заливка внутренней тестовой панели.',
  '--color-semantic-shadow-soft': 'Мягкая тень малой высоты для компактной поверхности.',
  '--color-semantic-shadow-medium': 'Средняя тень приподнятой карточки или панели.',
  '--color-semantic-shadow-strong':
    'Сильная тень верхнего слоя или выразительной модальной поверхности.',
  '--color-semantic-effect-focus-ring':
    'Цвет внешнего focus ring интерактивного элемента, реализованного эффектом.',
})

const TEXT = [FIGMA_COLOR_SCOPES.TEXT_FILL]
const ICON = [FIGMA_COLOR_SCOPES.SHAPE_FILL, FIGMA_COLOR_SCOPES.STROKE_COLOR]
const FRAME = [FIGMA_COLOR_SCOPES.FRAME_FILL]
const STROKE = [FIGMA_COLOR_SCOPES.STROKE_COLOR]
const FOREGROUND = [
  FIGMA_COLOR_SCOPES.SHAPE_FILL,
  FIGMA_COLOR_SCOPES.TEXT_FILL,
  FIGMA_COLOR_SCOPES.STROKE_COLOR,
]
const SHAPE = [FIGMA_COLOR_SCOPES.SHAPE_FILL]
const EFFECT = [FIGMA_COLOR_SCOPES.EFFECT_COLOR]

export function semanticScopes(cssName) {
  if (cssName.startsWith('--color-semantic-text-')) return TEXT
  if (cssName.startsWith('--color-semantic-icon-')) return ICON
  if (cssName.startsWith('--color-semantic-background-platform-')) return []
  if (cssName.startsWith('--color-semantic-background-')) return FRAME
  if (cssName.startsWith('--color-semantic-border-')) return STROKE
  if (cssName.startsWith('--color-semantic-button-')) {
    if (cssName.endsWith('-background') || cssName.endsWith('-background-hover')) return FRAME
    if (cssName.endsWith('-border') || cssName.endsWith('-border-hover')) return STROKE
    if (cssName.endsWith('-foreground')) return FOREGROUND
  }
  if (cssName.startsWith('--color-semantic-shape-')) return SHAPE
  if (cssName.startsWith('--color-semantic-content-accent-')) return SHAPE
  if (cssName.startsWith('--color-semantic-overlay-')) return FRAME
  if (cssName.startsWith('--color-semantic-gradient-')) return SHAPE
  if (
    cssName.startsWith('--color-semantic-shadow-') ||
    cssName.startsWith('--color-semantic-effect-')
  ) {
    return EFFECT
  }
  throw new Error(`No Figma Scope rule for ${cssName}`)
}

export function semanticHiddenFromPublishing(cssName) {
  return false
}
