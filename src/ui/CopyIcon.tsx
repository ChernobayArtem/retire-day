import copyIconUrl from '../assets/copy-icon.svg'

/** Canonical copy glyph supplied for the application UI. */
export function CopyIcon() {
  return (
    <img
      className="copy-icon"
      src={copyIconUrl}
      width="20"
      height="20"
      alt=""
      aria-hidden="true"
    />
  )
}
