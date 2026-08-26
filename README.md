# ридэй

Небольшое личное PWA — календарь-отсчёт на август 2026.

## Стек

Vite + React + TypeScript, vite-plugin-pwa.

## Разработка

```bash
npm install
npm run dev        # http://localhost:5173/retire-day/ (технический путь для совместимости)
npm run build
npm run typecheck
```

## UI kit

Код — источник истины для интерфейсной системы: токены и компоненты находятся
в `src/ui/`, правила задокументированы в [`docs/UI_KIT.md`](docs/UI_KIT.md).
Каталог компонентов открывается только в тестовой сессии через `?ui-kit=1`
или кнопку `UI kit` на тестовой панели.

## Контент

Локальные исходники собраны в одной игнорируемой Git папке
`local-content/`. Единственный актуальный источник данных приложения —
`local-content/current/`; для личных фото и видео внутри проекта хранится только
подготовленная актуальная версия, без отдельного архива оригиналов. Полная схема описана в
[`docs/CONTENT_STRUCTURE.md`](docs/CONTENT_STRUCTURE.md).

## Деплой

GitHub Actions собирает проект и публикует на GitHub Pages при пуше в `main`.

Один раз включить в репозитории: **Settings → Pages → Source: GitHub Actions**.
