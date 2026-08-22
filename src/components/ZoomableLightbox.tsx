import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { IconButton, Icons } from '../ui'
import { downloadMedia } from '../lib/download'
import { cachedMediaBlob } from '../lib/vault'

interface Props {
  src: string | null
  alt?: string
  sourcePath: string
  downloadName: string
  onClose: () => void
}

interface Point {
  x: number
  y: number
}

interface Transform {
  scale: number
  x: number
  y: number
}

interface PanGesture {
  pointerId: number
  pointer: Point
  transform: Transform
}

interface PinchGesture {
  distance: number
  contentX: number
  contentY: number
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const RESET_TRANSFORM: Transform = { scale: MIN_SCALE, x: 0, y: 0 }

function point(event: ReactPointerEvent<HTMLElement>): Point {
  return { x: event.clientX, y: event.clientY }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export default function ZoomableLightbox({
  src,
  alt = 'Фотография',
  sourcePath,
  downloadName,
  onClose,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const pointersRef = useRef(new Map<number, Point>())
  const panRef = useRef<PanGesture | null>(null)
  const pinchRef = useRef<PinchGesture | null>(null)
  const transformRef = useRef<Transform>(RESET_TRANSFORM)
  const pointerStartRef = useRef<Point | null>(null)
  const pointerStartedOnImageRef = useRef(false)
  const movedRef = useRef(false)
  const multiTouchRef = useRef(false)
  const lastTapRef = useRef<{ at: number; point: Point } | null>(null)
  const lastTouchZoomRef = useRef(0)
  const suppressCloseUntilRef = useRef(0)
  const onCloseRef = useRef(onClose)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [transform, setTransformState] = useState<Transform>(RESET_TRANSFORM)
  const [interacting, setInteracting] = useState(false)

  const constrain = useCallback((next: Transform): Transform => {
    const root = rootRef.current
    const image = imageRef.current
    const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE)
    if (!root || !image || scale <= MIN_SCALE) return RESET_TRANSFORM

    const maxX = Math.max(0, (image.offsetWidth * scale - root.clientWidth) / 2)
    const maxY = Math.max(0, (image.offsetHeight * scale - root.clientHeight) / 2)
    return {
      scale,
      x: clamp(next.x, -maxX, maxX),
      y: clamp(next.y, -maxY, maxY),
    }
  }, [])

  const setTransform = useCallback(
    (next: Transform, shouldConstrain = true) => {
      const value = shouldConstrain ? constrain(next) : next
      transformRef.current = value
      setTransformState(value)
    },
    [constrain],
  )

  const zoomAt = useCallback(
    (clientPoint: Point) => {
      const root = rootRef.current
      if (!root) return
      const current = transformRef.current
      if (current.scale > MIN_SCALE + 0.05) {
        setTransform(RESET_TRANSFORM)
        return
      }

      const rect = root.getBoundingClientRect()
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const scale = DOUBLE_TAP_SCALE
      setTransform({
        scale,
        x: (clientPoint.x - origin.x) * (1 - scale),
        y: (clientPoint.y - origin.y) * (1 - scale),
      })
    },
    [setTransform],
  )

  useEffect(() => {
    setTransform(RESET_TRANSFORM, false)
    pointersRef.current.clear()
    panRef.current = null
    pinchRef.current = null
    lastTapRef.current = null
  }, [setTransform, src])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key === 'Tab') {
        const controls = [downloadButtonRef.current, closeButtonRef.current].filter(
          (control): control is HTMLButtonElement => Boolean(control && !control.disabled),
        )
        if (controls.length === 0) return
        event.preventDefault()
        const current = controls.indexOf(document.activeElement as HTMLButtonElement)
        const next = event.shiftKey
          ? (current <= 0 ? controls.length : current) - 1
          : (current + 1) % controls.length
        controls[next].focus({ preventScroll: true })
      }
    }
    closeButtonRef.current?.focus({ preventScroll: true })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [])

  function beginPinch() {
    const root = rootRef.current
    const points = Array.from(pointersRef.current.values())
    if (!root || points.length < 2) return

    const current = transformRef.current
    const center = midpoint(points[0], points[1])
    const rect = root.getBoundingClientRect()
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    pinchRef.current = {
      distance: Math.max(1, distance(points[0], points[1])),
      contentX: (center.x - origin.x - current.x) / current.scale,
      contentY: (center.y - origin.y - current.y) / current.scale,
    }
    panRef.current = null
    multiTouchRef.current = true
    suppressCloseUntilRef.current = performance.now() + 500
    setInteracting(true)
  }

  function beginPan(pointerId: number, pointerPoint: Point) {
    panRef.current = {
      pointerId,
      pointer: pointerPoint,
      transform: transformRef.current,
    }
    pinchRef.current = null
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const nextPoint = point(event)
    pointersRef.current.set(event.pointerId, nextPoint)
    if (event.target !== event.currentTarget || transformRef.current.scale > MIN_SCALE + 0.05) {
      suppressCloseUntilRef.current = performance.now() + 500
    }

    if (pointersRef.current.size === 1) {
      pointerStartRef.current = nextPoint
      pointerStartedOnImageRef.current = event.target === imageRef.current
      movedRef.current = false
      multiTouchRef.current = false
      beginPan(event.pointerId, nextPoint)
    } else if (pointersRef.current.size === 2) {
      beginPinch()
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return
    const nextPoint = point(event)
    pointersRef.current.set(event.pointerId, nextPoint)

    const pointerStart = pointerStartRef.current
    if (pointerStart && distance(pointerStart, nextPoint) > 6) {
      movedRef.current = true
      suppressCloseUntilRef.current = performance.now() + 500
    }

    const points = Array.from(pointersRef.current.values())
    if (points.length >= 2 && pinchRef.current) {
      event.preventDefault()
      const pinch = pinchRef.current
      const center = midpoint(points[0], points[1])
      const root = rootRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const scale = clamp(
        transformRef.current.scale * (distance(points[0], points[1]) / pinch.distance),
        MIN_SCALE,
        MAX_SCALE,
      )

      // Rebase the gesture after every frame. This keeps the point between the
      // fingers visually anchored while both fingers move or change distance.
      setTransform({
        scale,
        x: center.x - origin.x - pinch.contentX * scale,
        y: center.y - origin.y - pinch.contentY * scale,
      })
      const current = transformRef.current
      pinchRef.current = {
        distance: Math.max(1, distance(points[0], points[1])),
        contentX: (center.x - origin.x - current.x) / current.scale,
        contentY: (center.y - origin.y - current.y) / current.scale,
      }
      return
    }

    const pan = panRef.current
    if (
      points.length === 1 &&
      pan?.pointerId === event.pointerId &&
      pan.transform.scale > MIN_SCALE
    ) {
      event.preventDefault()
      setInteracting(true)
      setTransform({
        ...pan.transform,
        x: pan.transform.x + nextPoint.x - pan.pointer.x,
        y: pan.transform.y + nextPoint.y - pan.pointer.y,
      })
    }
  }

  function finishPointer(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const wasLastPointer = pointersRef.current.size === 1
    const releasedPoint = pointersRef.current.get(event.pointerId) ?? point(event)
    pointersRef.current.delete(event.pointerId)

    if (
      wasLastPointer &&
      !cancelled &&
      event.pointerType !== 'mouse' &&
      pointerStartedOnImageRef.current &&
      !movedRef.current &&
      !multiTouchRef.current
    ) {
      const now = performance.now()
      const previousTap = lastTapRef.current
      if (
        previousTap &&
        now - previousTap.at < 320 &&
        distance(previousTap.point, releasedPoint) < 36
      ) {
        lastTapRef.current = null
        lastTouchZoomRef.current = now
        zoomAt(releasedPoint)
      } else {
        lastTapRef.current = { at: now, point: releasedPoint }
      }
    }

    if (pointersRef.current.size >= 2) {
      beginPinch()
      return
    }

    if (pointersRef.current.size === 1) {
      const [remainingId, remainingPoint] = Array.from(pointersRef.current.entries())[0]
      beginPan(remainingId, remainingPoint)
      return
    }

    panRef.current = null
    pinchRef.current = null
    setInteracting(false)
    setTransform(transformRef.current.scale < 1.05 ? RESET_TRANSFORM : transformRef.current)
  }

  function handleDoubleClick(event: ReactMouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    event.preventDefault()
    if (!pointerStartedOnImageRef.current) return
    // Safari can emit both pointer taps and a synthetic dblclick for the same
    // two touches. The custom touch handler has already zoomed in that case.
    if (performance.now() - lastTouchZoomRef.current < 500) return
    zoomAt({ x: event.clientX, y: event.clientY })
  }

  return (
    <div
      ref={rootRef}
      className={'lightbox' + (interacting ? ' is-interacting' : '')}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографии"
      aria-describedby="lightbox-hint"
      onClick={(event) => {
        event.stopPropagation()
        if (
          event.target === event.currentTarget &&
          transformRef.current.scale <= MIN_SCALE + 0.05 &&
          performance.now() >= suppressCloseUntilRef.current
        ) {
          onClose()
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={(event) => finishPointer(event, true)}
      onLostPointerCapture={(event) => {
        if (pointersRef.current.has(event.pointerId)) finishPointer(event, true)
      }}
      onDoubleClick={handleDoubleClick}
    >
      <IconButton
        ref={downloadButtonRef}
        className="lightbox__download"
        variant="ghost"
        aria-label="Скачать фотографию"
        icon={<Icons.Download />}
        disabled={!src}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          if (src) downloadMedia(src, downloadName, cachedMediaBlob(sourcePath))
        }}
      />
      <IconButton
        ref={closeButtonRef}
        className="lightbox__close"
        variant="ghost"
        aria-label="Закрыть фотографию"
        icon={<Icons.Close />}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
      />

      {src ? (
        <img
          ref={imageRef}
          className="lightbox__image"
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          }}
        />
      ) : (
        <span className="lightbox__spinner" role="status" aria-label="Фотография загружается" />
      )}

      <p className="lightbox__hint" id="lightbox-hint">
        {transform.scale > MIN_SCALE
          ? `${Math.round(transform.scale * 100)}% · двигай фото одним пальцем`
          : 'Разведи два пальца или дважды коснись фото'}
      </p>
    </div>
  )
}
