# Color system

## Source of truth

- Значения цветов: CSS-файлы в `src/ui/tokens/`.
- Назначение, Figma Scope и публикация: `design-tokens/color-contract.mjs`.
- Контраст реальных foreground/background пар: `design-tokens/color-contrast-contract.mjs`.
- Методика и проверенные коэффициенты: `docs/COLOR_CONTRAST.md`.
- Полный Figma-ready реестр: `design-tokens/generated/color-variables.figma.json`.
- Продуктовый UI использует только semantic-токены. Primitive и alias всегда служебные.
- Для Dev Mode каждая переменная хранит WEB code syntax в формате `var(--color-...)`.

## Layers

1. `color-primitives` — сырые значения палитры; Scope отключён, коллекция скрыта.
2. `color-alias` — промежуточные решения палитры и единая точка смены цвета; Scope отключён, коллекция скрыта.
3. `color-semantic` — продуктовые роли с точным Scope; это единственная публичная коллекция.

Имена непрозрачных примитивов описывают оттенок и роль (`blue/faint`, `neutral/heading`, `rose/brand`), а не требуют запоминать шкалу 100/200. Имена `alpha/*` также используют понятные роли (`alpha/black/subtle`, `alpha/red/focus`). Точные значения остаются внутренней реализацией primitive-слоя.

## Surface hierarchy

| Уровень | Значение | Использование |
| --- | --- | --- |
| canvas | `#ffffff` | Самый нижний фон приложения; на нём размещаются экраны и поверхности. |
| level-0 | `#ffffff` | Базовые карточки, шторки, модальные экраны и обычные панели. |
| level-1 | `#faf8fa` | Первый вложенный уровень: input, subtle-контейнер и hover белого контрола. |
| level-2 | `#f8f6f8` | Второй вложенный уровень: архив, badges, empty state и muted-контролы. |
| level-3 | `#f8f5f7` | Самый глубокий тёплый inset-уровень: строки кодов и плотные локальные группы. |
| inverse | `#2b2229` | Тёмная поверхность для светлого foreground и медиа-контекста. |

Правило вложенности: `canvas → level-0 → level-1 → level-2 → level-3`. Следующий уровень используется только внутри предыдущего и должен обозначать реальную группировку, а не декоративную полоску. `inverse` — отдельная тёмная ветка для медиа.

## Figma Scope matrix

| Семантическая группа | Scope | Где показывать |
| --- | --- | --- |
| Text | `TEXT_FILL` | Только заливка текста |
| Icon | `SHAPE_FILL + STROKE_COLOR` | Fill- и stroke-иконки |
| Background | `FRAME_FILL` | Только заливка Frame |
| Border | `STROKE_COLOR` | Только обводка |
| Button foreground | `TEXT_FILL + SHAPE_FILL + STROKE_COLOR` | Label и обе разновидности иконок внутри одного контрола |
| Shape | `SHAPE_FILL` | Только геометрическая форма |
| Overlay | `FRAME_FILL` | Overlay в системе всегда строится Frame |
| Shadow / Effect | `EFFECT_COLOR` | Только цвет эффекта |
| Primitive / Alias / Platform internal | `—` | Scope отключён; в picker не показывается |

`ALL_SCOPES` является эксклюзивным. `ALL_FILLS` уже включает Frame, Shape и Text и не комбинируется с отдельными fill-scopes. Пустой массив Scope скрывает переменную из property picker.

## Semantic variables

У каждой переменной ниже полное назначение также записано в поле `description` Figma-ready реестра.

| Variable | Value | Scope | Description |
| --- | --- | --- | --- |
| `text/primary` | `#241a22` | `TEXT_FILL` | Основной текст интерфейса, значения полей и обычный читаемый контент. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/heading` | `#353535` | `TEXT_FILL` | Заголовки экранов, шторок, карточек и крупных смысловых разделов. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/secondary` | `#6e676c` | `TEXT_FILL` | Поясняющий текст средней важности, подписи, даты и метаинформация. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/muted` | `#6e676c` | `TEXT_FILL` | Приглушённый вспомогательный текст, который не конкурирует с основным содержанием. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/disabled` | `#9e9e9e` | `TEXT_FILL` | Текст недоступного состояния; не применять для обычного вторичного текста. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/inverse` | `#ffffff` | `TEXT_FILL` | Светлый текст на тёмной, цветной или медиа-поверхности. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/brand` | `#a93235` | `TEXT_FILL` | Функциональный брендовый акцент в тексте: активное или текущее состояние. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/action` | `#0213ff` | `TEXT_FILL` | Текст утилитарного действия, например копирования или возврата. Scope Figma: Text — переменная показывается только для заливки текста. |
| `text/danger` | `#a93235` | `TEXT_FILL` | Текст ошибки или опасного состояния; не использовать декоративно. Scope Figma: Text — переменная показывается только для заливки текста. |
| `icon/primary` | `#241a22` | `SHAPE_FILL + STROKE_COLOR` | Основные системные иконки на светлой поверхности. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. Scope Figma: Stroke — переменная показывается только для обводки. |
| `icon/muted` | `#6e676c` | `SHAPE_FILL + STROKE_COLOR` | Второстепенные иконки и неактивные графические маркеры. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. Scope Figma: Stroke — переменная показывается только для обводки. |
| `icon/inverse` | `#ffffff` | `SHAPE_FILL + STROKE_COLOR` | Светлые системные иконки на тёмной, цветной или медиа-поверхности. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. Scope Figma: Stroke — переменная показывается только для обводки. |
| `icon/brand` | `#a93235` | `SHAPE_FILL + STROKE_COLOR` | Функциональные брендовые иконки активного или текущего состояния. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. Scope Figma: Stroke — переменная показывается только для обводки. |
| `icon/danger` | `#a93235` | `SHAPE_FILL + STROKE_COLOR` | Иконки ошибки или потенциально опасного действия. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. Scope Figma: Stroke — переменная показывается только для обводки. |
| `background/canvas` | `#ffffff` | `FRAME_FILL` | Корневой canvas приложения; самый нижний фон всего экрана. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/surface/level/0` | `#ffffff` | `FRAME_FILL` | Surface Level 0: карточки, шторки, модальные экраны и панели поверх canvas. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/surface/level/1` | `#faf8fa` | `FRAME_FILL` | Surface Level 1: первый вложенный слой, input или hover светлого контрола. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/surface/level/2` | `#f8f6f8` | `FRAME_FILL` | Surface Level 2: второй вложенный слой, архив, badge или empty state. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/surface/level/3` | `#f8f5f7` | `FRAME_FILL` | Surface Level 3: глубокий inset-слой для строк кодов и плотных локальных групп. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/surface/inverse` | `#2b2229` | `FRAME_FILL` | Тёмная инверсная поверхность для светлого foreground и медиа-контекста. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/brand/page` | `#fff7fb` | `FRAME_FILL` | Мягкий брендовый фон полноэкранного служебного состояния, например просьбы повернуть устройство. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/brand/subtle` | `#ffedee` | `FRAME_FILL` | Мягкая брендовая заливка выбранного или эмоционально выделенного блока. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/brand/faint` | `#fff8f8` | `FRAME_FILL` | Едва заметная брендовая заливка компактного текущего состояния. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/danger/subtle` | `rgba(255, 94, 97, 0.1)` | `FRAME_FILL` | Слабая заливка ошибки или предупреждения без потери читаемости. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/media` | `#000000` | `FRAME_FILL` | Базовая тёмная поверхность вокруг фото или видео. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/media/placeholder` | `#f4f4f4` | `FRAME_FILL` | Нейтральная область до появления или расшифровки медиа. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/message` | `#006fc9` | `FRAME_FILL` | Заливка синего сообщения, его хвоста и связанных реакций. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/skeleton` | `#f0edf1` | `FRAME_FILL` | Базовая заливка состояния загрузки и skeleton-элемента. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/tooltip` | `#202020` | `FRAME_FILL` | Фон информационной подсказки поверх интерфейса. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `background/transparent` | `rgba(0, 0, 0, 0)` | `FRAME_FILL` | Прозрачная заливка, сохраняющая геометрию и hit area контрола. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `border/default` | `#8a8a8a` | `STROKE_COLOR` | Стандартная функциональная обводка кнопки, поля или контейнера. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/progress/connector` | `#c8c8c8` | `STROKE_COLOR` | Линия-коннектор между подписью процента и шкалой прогресса. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/subtle` | `#f1edf2` | `STROKE_COLOR` | Слабая декоративная граница между соседними светлыми поверхностями. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/brand` | `#a93235` | `STROKE_COLOR` | Брендовая обводка активного, текущего или сфокусированного элемента. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/brand/strong` | `#8f2930` | `STROKE_COLOR` | Усиленная брендовая обводка выбранного таба или акцентной поверхности. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/danger` | `#a93235` | `STROKE_COLOR` | Обводка ошибки, опасного состояния или предупреждающей карточки. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/inverse/subtle` | `rgba(255, 255, 255, 0.4)` | `STROKE_COLOR` | Слабая светлая обводка контрола поверх тёмного медиа. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/inverse/strong` | `#ffffff` | `STROKE_COLOR` | Контрастная светлая обводка loader или активного медиа-контрола. Scope Figma: Stroke — переменная показывается только для обводки. |
| `border/transparent` | `rgba(0, 0, 0, 0)` | `STROKE_COLOR` | Прозрачная обводка, сохраняющая геометрию между состояниями. Scope Figma: Stroke — переменная показывается только для обводки. |
| `button/outline/background` | `#ffffff` | `FRAME_FILL` | Фон обычной светлой outline-кнопки. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/outline/background/hover` | `#faf8fa` | `FRAME_FILL` | Фон светлой outline-кнопки при наведении указателя. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/outline/border` | `#8a8a8a` | `STROKE_COLOR` | Обводка светлой outline-кнопки во всех обычных состояниях. Scope Figma: Stroke — переменная показывается только для обводки. |
| `button/outline/foreground` | `#241a22` | `SHAPE_FILL + TEXT_FILL + STROKE_COLOR` | Текст и системная иконка светлой outline-кнопки. Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола. |
| `button/primary/background` | `#a93235` | `FRAME_FILL` | Фон главной брендовой кнопки в обычном состоянии. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/primary/background/hover` | `#8f2930` | `FRAME_FILL` | Фон главной брендовой кнопки при hover или pressed. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/primary/border` | `#a93235` | `STROKE_COLOR` | Обводка главной брендовой кнопки в обычном состоянии. Scope Figma: Stroke — переменная показывается только для обводки. |
| `button/primary/border/hover` | `#8f2930` | `STROKE_COLOR` | Обводка главной брендовой кнопки при hover или pressed. Scope Figma: Stroke — переменная показывается только для обводки. |
| `button/primary/foreground` | `#ffffff` | `SHAPE_FILL + TEXT_FILL + STROKE_COLOR` | Текст и системная иконка главной брендовой кнопки. Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола. |
| `button/soft/background` | `#ffedee` | `FRAME_FILL` | Мягкий брендовый фон вторичной кнопки или badge. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/soft/background/hover` | `#ffd0dc` | `FRAME_FILL` | Мягкий брендовый фон вторичной кнопки при наведении. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/soft/foreground` | `#a93235` | `SHAPE_FILL + TEXT_FILL + STROKE_COLOR` | Текст и системная иконка мягкой брендовой кнопки. Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола. |
| `button/action/background` | `#f0f1ff` | `FRAME_FILL` | Мягкий фон утилитарного действия, например копирования. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/action/background/hover` | `#e4e6ff` | `FRAME_FILL` | Мягкий фон утилитарного действия при наведении. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/action/foreground` | `#0213ff` | `SHAPE_FILL + TEXT_FILL + STROKE_COLOR` | Текст и системная иконка утилитарного действия. Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола. |
| `button/disabled/background` | `#f5f5f5` | `FRAME_FILL` | Фон недоступной кнопки или иконки-кнопки. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `button/disabled/foreground` | `#9e9e9e` | `SHAPE_FILL + TEXT_FILL + STROKE_COLOR` | Текст и системная иконка недоступной кнопки. Scope Figma: Text, Shape и Stroke — единый foreground намеренно окрашивает label, fill-иконку и stroke-иконку внутри одного контрола. |
| `shape/divider` | `#f1edf2` | `SHAPE_FILL` | Заливка геометрической линии Divider; это shape, а не stroke. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `shape/carousel/active` | `#a93235` | `SHAPE_FILL` | Активная точка пагинации фотокарусели. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `shape/carousel/inactive` | `#8a8a8a` | `SHAPE_FILL` | Неактивная точка пагинации фотокарусели. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `shape/message/tail` | `#006fc9` | `SHAPE_FILL` | Треугольный хвост синего пузыря сообщения. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `shape/tooltip/pointer` | `#202020` | `SHAPE_FILL` | Треугольный хвост tooltip, совпадающий с его фоном. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `shape/brand/soft` | `#ff9cba` | `SHAPE_FILL` | Мягкая брендовая форма внутри служебной иллюстрации интерфейса. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/compliment` | `#ff5ea8` | `SHAPE_FILL` | Акцент категории «Комплимент» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/photos` | `#7ac2ff` | `SHAPE_FILL` | Акцент категории «Фотографии» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/certificate` | `#a24cc9` | `SHAPE_FILL` | Акцент категории «Сертификат» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/coupon` | `#e8a13a` | `SHAPE_FILL` | Акцент категории «Купон» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/restaurant` | `#7bd88f` | `SHAPE_FILL` | Акцент категории «Ресторан» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `content/accent/video` | `#269dfd` | `SHAPE_FILL` | Акцент категории «Видео» независимо от номера и длины календаря. Scope Figma: Shape — переменная показывается только для заливки геометрических форм. |
| `overlay/sheet` | `rgba(36, 26, 34, 0.4)` | `FRAME_FILL` | Затемнение основного экрана под открытой шторкой дня. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/media/soft` | `rgba(20, 18, 24, 0.18)` | `FRAME_FILL` | Слабое затемнение поверх медиапостера или фотографии. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/media/medium` | `rgba(20, 18, 24, 0.26)` | `FRAME_FILL` | Среднее затемнение между светлым и сильным stop градиента медиапостера. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/media/strong` | `rgba(20, 18, 24, 0.42)` | `FRAME_FILL` | Сильное затемнение поверх медиапостера для читаемого foreground. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/control` | `rgba(0, 0, 0, 0.55)` | `FRAME_FILL` | Полупрозрачный тёмный фон контрола поверх фото или видео. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/control/strong` | `rgba(0, 0, 0, 0.58)` | `FRAME_FILL` | Усиленный тёмный фон важной плашки поверх фото или видео. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/fullscreen` | `rgba(0, 0, 0, 0.92)` | `FRAME_FILL` | Почти непрозрачный фон полноэкранного просмотра медиа. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/glass` | `rgba(255, 255, 255, 0.92)` | `FRAME_FILL` | Светлая стеклянная заливка компактного контрола поверх контента. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `overlay/glass/strong` | `rgba(255, 255, 255, 0.94)` | `FRAME_FILL` | Более плотная стеклянная заливка внутренней тестовой панели. Scope Figma: Frame — переменная показывается только для заливки Frame. |
| `shadow/soft` | `rgba(36, 26, 34, 0.18)` | `EFFECT_COLOR` | Мягкая тень малой высоты для компактной поверхности. Scope Figma: Effects — переменная показывается только для цвета тени или другого эффекта. |
| `shadow/medium` | `rgba(47, 28, 40, 0.5)` | `EFFECT_COLOR` | Средняя тень приподнятой карточки или панели. Scope Figma: Effects — переменная показывается только для цвета тени или другого эффекта. |
| `shadow/strong` | `rgba(96, 42, 65, 0.55)` | `EFFECT_COLOR` | Сильная тень верхнего слоя или выразительной модальной поверхности. Scope Figma: Effects — переменная показывается только для цвета тени или другого эффекта. |
| `effect/focus/ring` | `rgba(169, 50, 53, 0.7)` | `EFFECT_COLOR` | Цвет внешнего focus ring интерактивного элемента, реализованного эффектом. Scope Figma: Effects — переменная показывается только для цвета тени или другого эффекта. |

## Enforcement

- Новый semantic-токен без явного назначения или Scope ломает `npm run audit:colors`.
- Недостаточный контраст текста, функциональной иконки, границы или состояния ломает `npm run audit:contrast:strict` и production build.
- Изменение CSS-токенов без обновления Figma-ready реестра также ломает аудит.
- Компаниям принадлежат цвета их логотипов; SVG-логотипы не являются палитрой приложения и остаются документированными исключениями.
- Технические цвета иллюстраций хранятся отдельно в коде, проходят аудит и намеренно не попадают в дизайнерскую палитру Figma.
