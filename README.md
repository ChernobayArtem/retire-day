# retire-day

Небольшое личное PWA — календарь-отсчёт на август 2026.

## Стек

Vite + React + TypeScript, Framer Motion, vite-plugin-pwa.

## Разработка

```bash
npm install
npm run dev        # http://localhost:5173/retire-day/
npm run build
npm run typecheck
```

## UI kit

Код — источник истины для интерфейсной системы: токены и компоненты находятся
в `src/ui/`, правила задокументированы в [`docs/UI_KIT.md`](docs/UI_KIT.md).
Каталог компонентов открывается только в тестовой сессии через `?ui-kit=1`
или кнопку `UI kit` на тестовой панели.

## Деплой

GitHub Actions собирает проект и публикует на GitHub Pages при пуше в `main`.

Один раз включить в репозитории: **Settings → Pages → Source: GitHub Actions**.
