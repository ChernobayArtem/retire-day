import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { downloadMedia } from '../lib/download'
import { cachedMediaBlob } from '../lib/vault'
import { IconButton, Icons } from '../ui'

interface Props {
  src: string | null
  poster: string | null
  sourcePath: string
  downloadName: string
  onClose: () => void
}

/** Fullscreen video viewer with app-owned close and download controls. */
export default function VideoLightbox({ src, poster, sourcePath, downloadName, onClose }: Props) {
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const controls = [downloadButtonRef.current, closeButtonRef.current, videoRef.current].filter(
        (control): control is HTMLButtonElement | HTMLVideoElement =>
          Boolean(control) && !(control instanceof HTMLButtonElement && control.disabled),
      )
      if (controls.length === 0) return

      event.preventDefault()
      const current = controls.indexOf(
        document.activeElement as HTMLButtonElement | HTMLVideoElement,
      )
      const next = event.shiftKey
        ? (current <= 0 ? controls.length : current) - 1
        : (current + 1) % controls.length
      controls[next].focus({ preventScroll: true })
    }

    closeButtonRef.current?.focus({ preventScroll: true })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <div
      className="video-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр видео"
      onClick={(event) => {
        event.stopPropagation()
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <IconButton
        ref={downloadButtonRef}
        className="video-lightbox__download"
        variant="ghost"
        aria-label="Скачать видео"
        icon={<Icons.Download />}
        disabled={!src}
        onClick={(event) => {
          event.stopPropagation()
          if (src) downloadMedia(src, downloadName, cachedMediaBlob(sourcePath))
        }}
      />
      <IconButton
        ref={closeButtonRef}
        className="video-lightbox__close"
        variant="ghost"
        aria-label="Закрыть видео"
        icon={<Icons.Close />}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
      />

      {src ? (
        <video
          ref={videoRef}
          className="video-lightbox__player"
          src={src}
          poster={poster ?? undefined}
          controls
          autoPlay
          playsInline
          preload="auto"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <div className="video-lightbox__loading">
          {poster && <img className="video-lightbox__poster" src={poster} alt="" />}
          <span className="video-lightbox__spinner" role="status" aria-label="Видео загружается" />
        </div>
      )}
    </div>,
    document.body,
  )
}
