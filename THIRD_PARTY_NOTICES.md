# Third-party notices

## Material Symbols

System icons in the application use selected **Material Symbols Outlined** SVG
paths from Google's Material Design Icons repository.

- Copyright Google LLC
- Licensed under the Apache License, Version 2.0
- Source: <https://github.com/google/material-design-icons/tree/master/symbols/web>
- License: <https://github.com/google/material-design-icons/blob/master/LICENSE>

The SVG paths are stored locally in `src/ui/Icons.tsx`. The application does not
load an icon font or contact Google at runtime.

## Onest

The product typeface is **Onest**, self-hosted rather than loaded from a CDN so
that the type system keeps working offline and the application never contacts a
third party at runtime.

- Copyright 2021 The Onest Project Authors
- Designed by Dmitri Voloshin and Andrey Kudryavtsev
- Licensed under the SIL Open Font License, Version 1.1
- Source: <https://github.com/simpals/onest>
- License text: `src/assets/fonts/OFL.txt`

The variable `woff2` faces in `src/assets/fonts/` cover the `latin`, `latin-ext`,
`cyrillic` and `cyrillic-ext` subsets across the 100-900 weight axis. They are the
files Google Fonts served, with the original unicode ranges preserved, so
rendering is unchanged.
