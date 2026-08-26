import { useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  CopyAction,
  CopyIcon,
  Divider,
  EmptyState,
  IconButton,
  IconLink,
  Icons,
  SheetFooter,
  Surface,
  Tab,
  TabsList,
  TextField,
} from './index'

type ShowcaseTab = 'overview' | 'saved' | 'settings'

export default function UIKitShowcase() {
  const [selectedTab, setSelectedTab] = useState<ShowcaseTab>('overview')
  const [displayName, setDisplayName] = useState('Александра')
  const [copied, setCopied] = useState(false)
  const [compactCopied, setCompactCopied] = useState(false)
  const [inlineCopied, setInlineCopied] = useState(false)

  function leaveShowcase() {
    const url = new URL(window.location.href)
    url.searchParams.delete('ui-kit')
    window.location.assign(url.toString())
  }

  return (
    <main className="ui-showcase" aria-labelledby="ui-showcase-title">
      <header className="ui-showcase__header">
        <Button
          className="ui-showcase__back"
          variant="outline"
          size="sm"
          leadingIcon={<Icons.ArrowLeft />}
          onClick={leaveShowcase}
        >
          В приложение
        </Button>
        <Badge variant="accent">Внутреннее превью</Badge>
        <h1 id="ui-showcase-title">ридэй UI kit</h1>
        <p>
          Компоненты показаны на вымышленных данных и не связаны с приложением, хранилищем или
          пользовательской сессией.
        </p>
      </header>

      <section className="ui-showcase__section" aria-labelledby="showcase-foundations">
        <h2 id="showcase-foundations">Основы</h2>
        <div className="ui-showcase__foundation-grid">
          <Surface variant="plain" className="ui-showcase__foundation-card">
            <p className="ui-type-label">Поверхности</p>
            <p className="ui-type-caption">canvas → level-0 → level-1 → level-2 → level-3</p>
          </Surface>
          <Surface variant="subtle" className="ui-showcase__foundation-card">
            <p className="ui-type-label">Близость</p>
            <p className="ui-type-caption">4–12px внутри группы · 16px+ между блоками</p>
          </Surface>
          <Surface variant="raised" className="ui-showcase__foundation-card">
            <p className="ui-type-label">Контролы</p>
            <p className="ui-type-caption">44/51px · focus-visible · reduced motion</p>
          </Surface>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-type">
        <div className="ui-showcase__section-heading">
          <h2 id="showcase-type">Типографика</h2>
          <Badge>Системная гарнитура</Badge>
        </div>
        <Surface variant="outlined" className="ui-showcase__type-sample">
          <p className="ui-type-display ui-showcase__display">Новая глава</p>
          <p className="ui-type-title ui-showcase__title">Заголовок экрана</p>
          <p className="ui-type-heading ui-showcase__heading">Заголовок смысловой группы</p>
          <p className="ui-type-body ui-showcase__body">
            Основной текст спокойно объясняет, что произойдёт после действия.
          </p>
          <p className="ui-type-label ui-showcase__label">Подпись элемента управления</p>
          <p className="ui-type-caption ui-showcase__caption">Вспомогательное пояснение</p>
          <p className="ui-type-caption ui-showcase__meta">31.08 · вымышленные данные</p>
        </Surface>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-buttons">
        <h2 id="showcase-buttons">Кнопки</h2>
        <div className="ui-showcase__stack">
          <div className="ui-showcase__row">
            <Button variant="primary" leadingIcon={<Icons.Sparkle />}>
              Основное действие
            </Button>
            <Button variant="outline" leadingIcon={<Icons.ArrowLeft />}>
              Белая кнопка
            </Button>
            <Button variant="soft" leadingIcon={<Icons.Grid />}>
              Мягкий акцент
            </Button>
            <Button variant="action" leadingIcon={<Icons.Check />}>
              Скопировать
            </Button>
            <Button variant="ghost" trailingIcon={<Icons.ChevronRight />}>
              Без фона
            </Button>
            <Button variant="link">Текстовое действие</Button>
          </div>
          <div className="ui-showcase__row">
            <Button size="sm" variant="outline">
              Маленькая
            </Button>
            <Button variant="outline" disabled>
              Недоступна
            </Button>
            <Button variant="primary" loading>
              Загрузка
            </Button>
            <Button variant="outline" fullWidth leadingIcon={<Icons.Check />}>
              Кнопка на всю ширину
            </Button>
          </div>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-icon-buttons">
        <h2 id="showcase-icon-buttons">Кнопки-иконки</h2>
        <div className="ui-showcase__row">
          <IconButton icon={<Icons.ArrowLeft />} aria-label="Вернуться назад" variant="outline" />
          <IconButton
            icon={<Icons.Close />}
            aria-label="Закрыть пример"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={<Icons.Sparkle />}
            aria-label="Выбрать случайный пример"
            variant="soft"
          />
          <IconButton icon={<CopyIcon />} aria-label="Скопировать пример" variant="action" />
          <IconButton icon={<Icons.Check />} aria-label="Сохранено" variant="primary" disabled />
          <IconButton
            icon={<Icons.Download />}
            aria-label="Скачать пример"
            variant="outline"
            loading
          />
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-inline-action">
        <h2 id="showcase-inline-action">Компактное действие</h2>
        <div className="ui-showcase__inline-action-grid">
          <Surface variant="subtle" className="ui-showcase__foundation-card">
            <div className="ui-showcase__code-cluster">
              <span className="ui-showcase__code-value">DEMO-1234</span>
              <IconLink
                icon={inlineCopied ? <Icons.Check /> : <CopyIcon />}
                aria-label="Скопировать демонстрационный код"
                onClick={() => {
                  setInlineCopied(true)
                  window.setTimeout(() => setInlineCopied(false), 1400)
                }}
              />
              <span className="ui-visually-hidden" role="status" aria-live="polite">
                {inlineCopied ? 'Код скопирован' : ''}
              </span>
            </div>
            <p className="ui-type-caption ui-showcase__inline-note">
              20px без padding, 8px от связанного кода.
            </p>
          </Surface>
          <Surface variant="subtle" className="ui-showcase__foundation-card">
            <div className="ui-showcase__code-cluster">
              <span className="ui-showcase__code-value">DEMO-5678</span>
              <IconLink icon={<CopyIcon />} aria-label="Копирование недоступно" disabled />
            </div>
            <p className="ui-type-caption ui-showcase__inline-note">
              Используется только рядом со значением, не как самостоятельная кнопка.
            </p>
          </Surface>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-fields">
        <h2 id="showcase-fields">Поля</h2>
        <div className="ui-showcase__field-grid">
          <TextField
            label="Отображаемое имя"
            value={displayName}
            onChange={(event) => setDisplayName(event.currentTarget.value)}
            hint="Это только локальный пример компонента."
            leadingIcon={<Icons.Sparkle />}
            fullWidth
          />
          <TextField
            label="Название подборки"
            placeholder="Например, тёплые воспоминания"
            trailingIcon={<Icons.Check />}
            fullWidth
          />
          <TextField label="Поле только для чтения" value="DEMO-0000" readOnly fullWidth />
          <TextField
            label="Код из примера"
            value="DEMO-0001"
            error="Этот демонстрационный код уже использован."
            readOnly
            fullWidth
          />
          <TextField label="Недоступное поле" value="Изменить нельзя" disabled fullWidth />
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-tabs">
        <h2 id="showcase-tabs">Табы и метаданные</h2>
        <div className="ui-showcase__stack">
          <TabsList aria-label="Разделы демонстрации">
            <Tab
              id="showcase-tab-overview"
              selected={selectedTab === 'overview'}
              aria-controls="showcase-tab-panel"
              icon={<Icons.Sparkle />}
              badge={<Badge>3</Badge>}
              onClick={() => setSelectedTab('overview')}
            >
              Обзор
            </Tab>
            <Tab
              id="showcase-tab-saved"
              selected={selectedTab === 'saved'}
              aria-controls="showcase-tab-panel"
              icon={<Icons.Grid />}
              badge={<Badge>8</Badge>}
              onClick={() => setSelectedTab('saved')}
            >
              Сохранённое
            </Tab>
            <Tab
              id="showcase-tab-settings"
              selected={selectedTab === 'settings'}
              aria-controls="showcase-tab-panel"
              onClick={() => setSelectedTab('settings')}
            >
              Настройки
            </Tab>
          </TabsList>
          <div
            id="showcase-tab-panel"
            className="ui-showcase__row"
            role="tabpanel"
            aria-labelledby={`showcase-tab-${selectedTab}`}
            aria-live="polite"
          >
            <Badge variant="accent">Выбрано: {selectedTab}</Badge>
            <Badge>3 примера</Badge>
            <Badge>Демо</Badge>
          </div>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-surfaces">
        <h2 id="showcase-surfaces">Поверхности и разделители</h2>
        <div className="ui-showcase__surface-grid">
          <Surface variant="plain">
            <h3>Plain</h3>
            <p>Базовая поверхность без дополнительного акцента.</p>
          </Surface>
          <Surface variant="subtle">
            <h3>Subtle</h3>
            <p>Спокойная группировка связанного содержимого.</p>
          </Surface>
          <Surface variant="outlined">
            <h3>Outlined</h3>
            <p>Группа, которой нужна явная, но лёгкая граница.</p>
          </Surface>
          <Surface variant="raised">
            <h3>Raised</h3>
            <p>Поверхность, находящаяся выше основного слоя.</p>
          </Surface>
        </div>
        <Divider />
        <div className="ui-showcase__split">
          <span>До разделителя</span>
          <Divider orientation="vertical" />
          <span>После разделителя</span>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-patterns">
        <h2 id="showcase-patterns">Готовые паттерны</h2>
        <div className="ui-showcase__stack">
          <div className="ui-showcase__row">
            <CopyAction
              copied={copied}
              onClick={() => {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1400)
              }}
            />
            <CopyAction
              copied={compactCopied}
              variant="link"
              size="sm"
              onClick={() => {
                setCompactCopied(true)
                window.setTimeout(() => setCompactCopied(false), 1400)
              }}
            />
          </div>
          <div className="ui-showcase__pattern-grid">
            <Surface variant="subtle" className="ui-showcase__pattern-card">
              <p className="ui-type-caption">Обычный день</p>
              <SheetFooter onPrevious={() => {}} onClose={() => {}} />
            </Surface>
            <Surface variant="subtle" className="ui-showcase__pattern-card">
              <p className="ui-type-caption">Первый доступный день</p>
              <SheetFooter previousDisabled onPrevious={() => {}} onClose={() => {}} />
            </Surface>
            <Surface variant="subtle" className="ui-showcase__pattern-card">
              <p className="ui-type-caption">Закрытый день</p>
              <SheetFooter showPrevious={false} onClose={() => {}} />
            </Surface>
            <Surface variant="subtle" className="ui-showcase__pattern-card">
              <EmptyState
                icon={<Icons.Sparkle />}
                title="Пока здесь пусто"
                description="Демонстрационный элемент появится после нужного действия."
              />
            </Surface>
          </div>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="showcase-icons">
        <h2 id="showcase-icons">Системные иконки</h2>
        <div className="ui-showcase__icon-grid">
          <IconSample name="Назад">
            <Icons.ArrowLeft />
          </IconSample>
          <IconSample name="Влево">
            <Icons.ChevronLeft />
          </IconSample>
          <IconSample name="Вправо">
            <Icons.ChevronRight />
          </IconSample>
          <IconSample name="Закрыть">
            <Icons.Close />
          </IconSample>
          <IconSample name="Сюрприз">
            <Icons.Sparkle />
          </IconSample>
          <IconSample name="Сетка">
            <Icons.Grid />
          </IconSample>
          <IconSample name="Готово">
            <Icons.Check />
          </IconSample>
          <IconSample name="Развернуть">
            <Icons.Expand />
          </IconSample>
          <IconSample name="Скачать">
            <Icons.Download />
          </IconSample>
          <IconSample name="Бонус">
            <Icons.Gift />
          </IconSample>
          <IconSample name="Копировать">
            <CopyIcon />
          </IconSample>
          <IconSample name="Воспроизвести">
            <Icons.Play />
          </IconSample>
        </div>
      </section>
    </main>
  )
}

function IconSample({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Surface variant="outlined" className="ui-showcase__icon-sample">
      <span aria-hidden="true">{children}</span>
      <span>{name}</span>
    </Surface>
  )
}
