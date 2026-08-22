/**
 * The spacing contract owns meaning, Figma publication and code syntax.
 * CSS files own the actual values. Keep this system intentionally compact:
 * distances describe reusable relationships, never a particular calendar day.
 */

export const FIGMA_SPACING_SCOPE = 'GAP'

export const spacingCollections = Object.freeze({
  primitives: {
    name: 'spacing-primitives',
    description:
      'Базовая шкала расстояний. Значения не выбираются напрямую в макетах или продуктовых компонентах: они питают alias-слой. Коллекция скрыта из публикации.',
    hiddenFromPublishing: true,
    modes: ['Value'],
  },
  aliases: {
    name: 'spacing-alias',
    description:
      'Промежуточные названные расстояния между базовой шкалой и продуктовой семантикой. Здесь можно менять соответствие роли и примитива без правки компонентов. Коллекция скрыта из публикации.',
    hiddenFromPublishing: true,
    modes: ['Value'],
  },
  semantic: {
    name: 'spacing-semantic',
    description:
      'Публичные расстояния дизайн-системы. В макетах и продуктовых компонентах выбираются только эти роли; Scope ограничен GAP.',
    hiddenFromPublishing: false,
    modes: ['Value'],
  },
})

export const spacingPrimitiveDefinitions = Object.freeze([
  {
    cssName: '--spacing-primitive-space-text',
    name: 'space/text',
    value: '4px',
    description:
      'Расстояние внутри одной текстовой мысли: между строковой меткой и связанным значением. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-inline',
    name: 'space/inline',
    value: '8px',
    description:
      'Компактная дистанция между элементами одной строки: иконкой и label, соседними controls или близкими metadata. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-stack',
    name: 'space/stack',
    value: '12px',
    description:
      'Обычная вертикальная дистанция внутри связанной группы контента. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-inset',
    name: 'space/inset',
    value: '16px',
    description:
      'Базовый внутренний отступ поверхности и боковой gutter мобильного экрана. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-group',
    name: 'space/group',
    value: '24px',
    description:
      'Дистанция между самостоятельными группами внутри одного экрана или поверхности. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-section',
    name: 'space/section',
    value: '32px',
    description:
      'Крупный внешний отступ между разделами страницы или вокруг содержательной области. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
  {
    cssName: '--spacing-primitive-space-empty',
    name: 'space/empty',
    value: '48px',
    description:
      'Воздух пустого состояния или намеренно редкой композиции. Не использовать для обычной группировки элементов. Использовать только как источник alias-переменных; Scope Figma отключён.',
  },
])

export const spacingAliasDefinitions = Object.freeze([
  {
    cssName: '--spacing-alias-gap-text',
    name: 'gap/text',
    target: '--spacing-primitive-space-text',
    purpose: 'Зазор между непосредственно связанными текстовыми частями.',
  },
  {
    cssName: '--spacing-alias-gap-inline',
    name: 'gap/inline',
    target: '--spacing-primitive-space-inline',
    purpose: 'Зазор между элементами одной строки или близкими controls.',
  },
  {
    cssName: '--spacing-alias-gap-stack',
    name: 'gap/stack',
    target: '--spacing-primitive-space-stack',
    purpose: 'Стандартный вертикальный зазор внутри связанной content-группы.',
  },
  {
    cssName: '--spacing-alias-inset-default',
    name: 'inset/default',
    target: '--spacing-primitive-space-inset',
    purpose: 'Стандартный внутренний отступ поверхности и основной мобильный gutter.',
  },
  {
    cssName: '--spacing-alias-gap-group',
    name: 'gap/group',
    target: '--spacing-primitive-space-group',
    purpose: 'Отделяет самостоятельные группы, не разрывая страницу на секции.',
  },
  {
    cssName: '--spacing-alias-inset-page',
    name: 'inset/page',
    target: '--spacing-primitive-space-section',
    purpose: 'Крупный внешний отступ содержательной области страницы.',
  },
  {
    cssName: '--spacing-alias-inset-empty',
    name: 'inset/empty',
    target: '--spacing-primitive-space-empty',
    purpose: 'Выделенный воздух для empty state или редкой финальной композиции.',
  },
])

export const spacingSemanticDefinitions = Object.freeze([
  {
    cssName: '--spacing-semantic-layout-page-gutter',
    name: 'layout/page-gutter',
    target: '--spacing-alias-inset-default',
    purpose: 'Боковой отступ экранного контента от границы мобильного viewport или sheet.',
  },
  {
    cssName: '--spacing-semantic-layout-inline-gap',
    name: 'layout/inline-gap',
    target: '--spacing-alias-gap-inline',
    purpose: 'Стандартный горизонтальный gap элементов, которые читаются одной строкой.',
  },
  {
    cssName: '--spacing-semantic-layout-content-gap',
    name: 'layout/content-gap',
    target: '--spacing-alias-gap-stack',
    purpose: 'Стандартный вертикальный gap внутри связанного блока контента.',
  },
  {
    cssName: '--spacing-semantic-layout-block-gap',
    name: 'layout/block-gap',
    target: '--spacing-alias-inset-default',
    purpose: 'Дистанция между близкими блоками, которые остаются одной смысловой группой.',
  },
  {
    cssName: '--spacing-semantic-layout-section-gap',
    name: 'layout/section-gap',
    target: '--spacing-alias-gap-group',
    purpose: 'Дистанция между самостоятельными разделами одного экрана.',
  },
  {
    cssName: '--spacing-semantic-layout-page-inset',
    name: 'layout/page-inset',
    target: '--spacing-alias-inset-page',
    purpose:
      'Крупный внешний отступ вокруг содержательной области страницы или самостоятельного empty state.',
  },
  {
    cssName: '--spacing-semantic-content-text-gap',
    name: 'content/text-gap',
    target: '--spacing-alias-gap-text',
    purpose: 'Минимальная дистанция между связанными строками текста, например label и значением.',
  },
  {
    cssName: '--spacing-semantic-control-padding-inline',
    name: 'control/padding-inline',
    target: '--spacing-alias-inset-default',
    purpose: 'Горизонтальный внутренний отступ стандартного control или кнопки.',
  },
  {
    cssName: '--spacing-semantic-control-icon-gap',
    name: 'control/icon-gap',
    target: '--spacing-alias-gap-inline',
    purpose: 'Расстояние между системной иконкой control и его label.',
  },
  {
    cssName: '--spacing-semantic-surface-padding',
    name: 'surface/padding',
    target: '--spacing-alias-inset-default',
    purpose: 'Базовый внутренний отступ карточки, sheet или обычной поверхности.',
  },
  {
    cssName: '--spacing-semantic-surface-padding-spacious',
    name: 'surface/padding-spacious',
    target: '--spacing-alias-gap-group',
    purpose: 'Увеличенный внутренний отступ самостоятельной поверхности с длинным контентом.',
  },
  {
    cssName: '--spacing-semantic-empty-state-padding',
    name: 'empty-state/padding',
    target: '--spacing-alias-inset-empty',
    purpose:
      'Вертикальный воздух для пустого или завершающего состояния, когда обычный section-gap недостаточен.',
  },
])

export const spacingDefinitionLayers = Object.freeze({
  primitive: spacingPrimitiveDefinitions,
  alias: spacingAliasDefinitions,
  semantic: spacingSemanticDefinitions,
})
