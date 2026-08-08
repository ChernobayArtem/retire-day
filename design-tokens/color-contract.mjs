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
      'Сырые значения палитры. Служебная коллекция: переменные из неё нельзя применять напрямую к макетам или компонентам.',
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
  '--color-semantic-text-main-primary':
    'Основной текст интерфейса, значения полей и обычный читаемый контент.',
  '--color-semantic-text-main-heading':
    'Главные заголовки экранов, шторок и крупных смысловых разделов.',
  '--color-semantic-text-main-display':
    'Крупный выразительный текст: акцентное число, финальный статус или единственный display-заголовок экрана.',
  '--color-semantic-text-main-warm-heading':
    'Заголовок на тёплой личной поверхности или в эмоциональном контентном блоке.',
  '--color-semantic-text-card-title':
    'Название карточки открытого сюрприза в архиве.',
  '--color-semantic-text-code-primary':
    'Сам код сертификата, купона или другое значение, которое пользователь копирует.',
  '--color-semantic-text-content-primary':
    'Основной длинный личный текст внутри контентной карточки.',
  '--color-semantic-text-control-primary':
    'Основная подпись компактного интерактивного контрола внутри контента.',
  '--color-semantic-text-warm-content':
    'Текст в тёплом legacy-блоке комплиментов; новые компоненты должны выбрать более общую роль.',
  '--color-semantic-text-main-secondary':
    'Вторичный текст, который поясняет основной контент, но остаётся хорошо читаемым.',
  '--color-semantic-text-main-secondary-strong':
    'Повышенно-контрастный вторичный текст для важной подписи под заголовком.',
  '--color-semantic-text-main-muted':
    'Приглушённые описания, пояснения и вспомогательный текст средней важности.',
  '--color-semantic-text-main-caption':
    'Компактная подпись или hint рядом с карточкой; менее заметна, чем обычный muted-текст.',
  '--color-semantic-text-main-subtle':
    'Малозаметный служебный текст, который не должен конкурировать с содержанием.',
  '--color-semantic-text-main-faint':
    'Самый слабый читаемый текст: дата, редкая метаинформация или второстепенная отметка.',
  '--color-semantic-text-main-disabled':
    'Недоступный текст, placeholder или подпись выключенного состояния.',
  '--color-semantic-text-progress-label':
    'Процент и числовая подпись неактивной части прогресс-бара.',
  '--color-semantic-text-calendar-number':
    'Номер дня внутри ячейки календаря.',
  '--color-semantic-text-card-secondary':
    'Вторичное описание внутри карточки архива.',
  '--color-semantic-text-card-meta':
    'Дата, категория и другая компактная метаинформация карточки архива.',
  '--color-semantic-text-code-label':
    'Короткий label перед значением кода, PIN или CVC.',
  '--color-semantic-text-warm-secondary':
    'Вторичная подпись на тёплом legacy-контенте.',
  '--color-semantic-text-content-secondary':
    'Вторичный текст внутри самостоятельного контентного блока.',
  '--color-semantic-text-inverse-primary':
    'Основной светлый текст на тёмной или насыщенной поверхности.',
  '--color-semantic-text-brand-default':
    'Текстовый бренд-акцент: текущая дата, важная отметка или эмоциональный акцент.',
  '--color-semantic-text-danger-default':
    'Текст ошибки или опасного состояния; не использовать как декоративный красный акцент.',

  '--color-semantic-icon-main-primary':
    'Основная системная иконка на светлой поверхности.',
  '--color-semantic-icon-inverse-primary':
    'Светлая системная иконка на тёмной, цветной или медиа-поверхности.',
  '--color-semantic-icon-brand-default':
    'Брендовая системная иконка, обозначающая активное или выделенное действие.',
  '--color-semantic-icon-danger-default':
    'Иконка ошибки или опасного действия.',
  '--color-semantic-icon-field-muted':
    'Приглушённая leading или trailing иконка текстового поля.',
  '--color-semantic-icon-progress-active':
    'Активная орхидея или другой системный маркер пройденной части прогресса.',
  '--color-semantic-icon-progress-inactive':
    'Неактивная орхидея или другой системный маркер непройденной части прогресса.',

  '--color-semantic-background-canvas':
    'Корневой canvas приложения — самый нижний слой, на котором строится весь экран.',
  '--color-semantic-background-brand-page':
    'Мягкий брендовый фон полноэкранного служебного состояния, например просьбы повернуть устройство.',
  '--color-semantic-background-surface-level-0':
    'Surface Level 0: базовые карточки, шторки, модальные экраны и панели поверх canvas.',
  '--color-semantic-background-surface-level-1':
    'Surface Level 1: первый вложенный слой, input, subtle-контейнер или hover белого контрола.',
  '--color-semantic-background-surface-level-2':
    'Surface Level 2: более заметное отделение — архив, badges, empty state и muted-контролы.',
  '--color-semantic-background-surface-level-3':
    'Surface Level 3: самый глубокий тёплый inset-слой для строк кодов и плотных локальных групп.',
  '--color-semantic-background-brand-faint':
    'Очень слабая брендовая заливка выделенного дня или компактного брендового состояния.',
  '--color-semantic-background-danger-subtle':
    'Слабая заливка опасного или предупреждающего блока без потери читаемости контента.',
  '--color-semantic-background-media-default':
    'Базовая тёмная поверхность фото- или видеоплеера, видимая вокруг медиа.',
  '--color-semantic-background-surface-inverse':
    'Инверсная тёмная поверхность для секции со светлым foreground.',
  '--color-semantic-background-tooltip':
    'Фон информационного tooltip; хвост tooltip использует отдельный shape-токен.',
  '--color-semantic-background-transparent':
    'Полностью прозрачная заливка интерактивного элемента, сохраняющая его геометрию и hit area.',
  '--color-semantic-background-archive-navigation':
    'Заливка круглого индикатора перехода в архив на главном экране.',
  '--color-semantic-background-calendar-past':
    'Заливка прошедшего или уже открытого дня календаря.',
  '--color-semantic-background-calendar-future':
    'Заливка будущего, ещё не открытого дня календаря.',
  '--color-semantic-background-calendar-today':
    'Заливка текущего дня календаря; активность дополнительно обозначается брендовой обводкой.',
  '--color-semantic-background-media-placeholder':
    'Нейтральная заливка области фото, видео или сертификата до появления медиа.',
  '--color-semantic-background-test-control':
    'Фон внутреннего тестового контрола; не является частью публичной дизайн-библиотеки.',
  '--color-semantic-background-coupon-legacy':
    'Фон старого шаблона купона; не применять в новых компонентах.',
  '--color-semantic-background-compliment-legacy':
    'Фон старого шаблона списка комплиментов; не применять в новых компонентах.',
  '--color-semantic-background-skeleton-base':
    'Базовый stop shimmer-градиента во время расшифровки или загрузки медиа.',
  '--color-semantic-background-skeleton-highlight':
    'Светлый stop shimmer-градиента во время расшифровки или загрузки медиа.',
  '--color-semantic-background-message-default':
    'Заливка синего сообщения, реакции и связанных круглых элементов мема.',
  '--color-semantic-background-platform-theme':
    'Цвет системного browser/PWA chrome; используется сборкой, а не макетами экранов.',
  '--color-semantic-background-platform-launch':
    'Фон launch screen PWA; используется manifest и не выбирается для компонентов.',

  '--color-semantic-border-default':
    'Стандартная нейтральная обводка кнопки, иконки-кнопки или контейнера.',
  '--color-semantic-border-subtle':
    'Слабая обводка, разделяющая соседние светлые поверхности.',
  '--color-semantic-border-brand':
    'Брендовая обводка активного, текущего или сфокусированного элемента.',
  '--color-semantic-border-brand-strong':
    'Усиленная брендовая обводка выбранного таба или акцентной поверхности.',
  '--color-semantic-border-danger':
    'Обводка ошибки, опасного состояния или купона с предупреждающим оформлением.',
  '--color-semantic-border-transparent':
    'Прозрачная обводка, сохраняющая размеры и геометрию компонента между состояниями.',
  '--color-semantic-border-progress-connector':
    'Линия-коннектор между подписью процента и шкалой прогресса.',
  '--color-semantic-border-overlay-hint':
    'Слабая светлая обводка подсказки поверх затемнённого lightbox.',
  '--color-semantic-border-overlay-control':
    'Светлая обводка кнопок закрытия и скачивания поверх медиа.',
  '--color-semantic-border-loader-track':
    'Полупрозрачный трек полноэкранного loader на тёмном медиа-фоне.',
  '--color-semantic-border-loader-indicator':
    'Яркий движущийся сегмент loader на тёмном медиа-фоне.',
  '--color-semantic-border-message-reaction':
    'Светлая обводка кругов реакции возле синего пузыря сообщения.',
  '--color-semantic-border-video-play':
    'Обводка центральной кнопки запуска видео поверх постера.',
  '--color-semantic-border-video-pending':
    'Обводка плашки видео, которое ещё не добавлено.',
  '--color-semantic-border-preview-loader-track':
    'Трек небольшого loader непосредственно в карточке видеопревью.',

  '--color-semantic-button-outline-background':
    'Обычный фон белой outline-кнопки.',
  '--color-semantic-button-outline-background-hover':
    'Фон белой outline-кнопки при наведении указателя.',
  '--color-semantic-button-outline-border':
    'Обычная обводка белой outline-кнопки.',
  '--color-semantic-button-outline-border-hover':
    'Усиленная обводка белой outline-кнопки при наведении указателя.',
  '--color-semantic-button-outline-foreground':
    'Текст и системная иконка белой outline-кнопки.',
  '--color-semantic-button-primary-background':
    'Обычный фон главной брендовой кнопки.',
  '--color-semantic-button-primary-background-hover':
    'Фон главной брендовой кнопки при наведении указателя.',
  '--color-semantic-button-primary-border':
    'Обычная обводка главной брендовой кнопки.',
  '--color-semantic-button-primary-border-hover':
    'Обводка главной брендовой кнопки при наведении указателя.',
  '--color-semantic-button-primary-foreground':
    'Текст и системная иконка главной брендовой кнопки.',
  '--color-semantic-button-soft-background':
    'Мягкий брендовый фон вторичной кнопки или badge.',
  '--color-semantic-button-soft-background-hover':
    'Мягкий брендовый фон вторичной кнопки при наведении указателя.',
  '--color-semantic-button-soft-foreground':
    'Текст и системная иконка мягкой брендовой кнопки.',
  '--color-semantic-button-action-background':
    'Мягкий синий фон утилитарного действия, например копирования.',
  '--color-semantic-button-action-background-hover':
    'Мягкий синий фон утилитарного действия при наведении указателя.',
  '--color-semantic-button-action-foreground':
    'Текст и системная иконка утилитарного действия, например копирования.',
  '--color-semantic-button-ghost-background':
    'Фон ghost-кнопки при hover; обычное состояние остаётся прозрачным.',
  '--color-semantic-button-ghost-foreground':
    'Текст и системная иконка ghost-кнопки.',
  '--color-semantic-button-link-foreground':
    'Текст и системная иконка link-кнопки.',
  '--color-semantic-button-disabled-background':
    'Фон недоступной кнопки или иконки-кнопки.',
  '--color-semantic-button-disabled-foreground':
    'Текст и системная иконка недоступной кнопки.',

  '--color-semantic-shape-divider':
    'Заливка геометрической линии Divider; это shape, а не stroke контейнера.',
  '--color-semantic-shape-archive-accent-default':
    'Тонкая акцентная плашка в верхней части карточки архива, когда нет индивидуального цвета дня.',
  '--color-semantic-shape-carousel-indicator-active':
    'Активная точка пагинации фотокарусели.',
  '--color-semantic-shape-carousel-indicator-inactive':
    'Неактивная точка пагинации фотокарусели.',
  '--color-semantic-shape-message-tail':
    'Треугольный хвост синего пузыря сообщения.',
  '--color-semantic-shape-tooltip-pointer':
    'Треугольный хвост tooltip, совпадающий с его фоном.',
  '--color-semantic-shape-brand-soft':
    'Небольшая мягкая брендовая декоративная форма внутри служебной иллюстрации интерфейса.',
  '--color-semantic-shape-finale-heart':
    'Полупрозрачное сердце в финальной сцене приложения.',
  '--color-semantic-shape-orchid-center':
    'Светлая центральная форма системной орхидеи прогресс-бара.',

  '--color-semantic-overlay-sheet':
    'Затемнение основного экрана под открытой шторкой дня.',
  '--color-semantic-overlay-media-soft':
    'Слабый stop градиента затемнения поверх медиапостера.',
  '--color-semantic-overlay-media-medium':
    'Средний stop градиента затемнения поверх медиапостера.',
  '--color-semantic-overlay-media-strong':
    'Сильный stop градиента затемнения поверх медиапостера.',
  '--color-semantic-overlay-control':
    'Полупрозрачный тёмный фон обычного контрола поверх фото или видео.',
  '--color-semantic-overlay-hint':
    'Полупрозрачный тёмный фон текстовой подсказки в lightbox.',
  '--color-semantic-overlay-play':
    'Полупрозрачный тёмный круг центральной кнопки запуска видео.',
  '--color-semantic-overlay-control-strong':
    'Усиленный тёмный фон важной плашки поверх медиапостера.',
  '--color-semantic-overlay-lightbox':
    'Почти непрозрачный фон полноэкранного просмотра фотографий.',
  '--color-semantic-overlay-video':
    'Почти непрозрачный фон полноэкранного просмотра видео.',
  '--color-semantic-overlay-glass':
    'Светлая стеклянная заливка компактного контрола поверх контента.',
  '--color-semantic-overlay-glass-strong':
    'Более плотная светлая стеклянная заливка тестовой панели.',
  '--color-semantic-gradient-sun-glow':
    'Цветной начальный stop декоративного свечения солнца в финальной сцене.',
  '--color-semantic-gradient-transparent-white':
    'Прозрачный конечный stop декоративного свечения солнца в финальной сцене.',

  '--color-semantic-shadow-soft':
    'Мягкая тень малой высоты для компактных поверхностей.',
  '--color-semantic-shadow-medium':
    'Средняя тень приподнятой карточки или панели.',
  '--color-semantic-shadow-strong':
    'Сильная тень верхнего слоя или выразительной модальной поверхности.',
  '--color-semantic-shadow-sheet':
    'Тень нижней шторки дня.',
  '--color-semantic-shadow-finale-ray':
    'Лёгкая тень декоративного луча в финальной сцене.',
  '--color-semantic-shadow-video-pending':
    'Тень плашки видео, которое ещё не добавлено.',
  '--color-semantic-shadow-media-expand':
    'Тень кнопки разворачивания фото или коллажа.',
  '--color-semantic-shadow-video-play':
    'Тень центральной кнопки запуска видео.',
  '--color-semantic-shadow-test-toolbar':
    'Тень внутренней тестовой панели; не использовать в продуктовом UI.',
  '--color-semantic-effect-focus-ring':
    'Цвет внешнего focus ring интерактивного элемента, реализованного через shadow/effect.',
})

const TEXT = [FIGMA_COLOR_SCOPES.TEXT_FILL]
const ICON = [FIGMA_COLOR_SCOPES.SHAPE_FILL, FIGMA_COLOR_SCOPES.STROKE_COLOR]
const FRAME = [FIGMA_COLOR_SCOPES.FRAME_FILL]
const STROKE = [FIGMA_COLOR_SCOPES.STROKE_COLOR]
const FOREGROUND = [
  FIGMA_COLOR_SCOPES.TEXT_FILL,
  FIGMA_COLOR_SCOPES.SHAPE_FILL,
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
  return (
    cssName.startsWith('--color-semantic-background-platform-') ||
    cssName === '--color-semantic-background-test-control' ||
    cssName === '--color-semantic-shadow-test-toolbar'
  )
}
