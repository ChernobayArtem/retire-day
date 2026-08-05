/** Add the original media extension to a friendly download name. */
export function mediaDownloadName(baseName: string, sourcePath: string): string {
  const cleanPath = sourcePath.split(/[?#]/, 1)[0]
  const match = cleanPath.match(/\.([a-z0-9]{2,5})$/i)
  const extension = match?.[1]?.toLowerCase()
  return extension ? `${baseName}.${extension}` : baseName
}

/**
 * Download an already resolved media URL. For vault files this URL points to
 * the decrypted in-memory Blob, so no plaintext path is ever published.
 */
function anchorDownload(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function isAppleTouchDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * iOS standalone PWAs can ignore Blob-backed `download` links. When possible,
 * hand the already decrypted file to the native share sheet, where it can be
 * saved to Photos or Files. Other platforms use a normal direct download.
 * There is intentionally no await before `navigator.share`: WebKit requires
 * the call to stay inside the original button activation.
 */
export function downloadMedia(url: string, fileName: string, blob?: Blob | null): void {
  if (blob && isAppleTouchDevice() && navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, {
      type: blob.type || 'application/octet-stream',
      lastModified: Date.now(),
    })
    if (navigator.canShare({ files: [file] })) {
      void navigator.share({ files: [file] }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        anchorDownload(url, fileName)
      })
      return
    }
  }

  anchorDownload(url, fileName)
}
