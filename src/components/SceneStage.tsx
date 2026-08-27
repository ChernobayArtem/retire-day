import { sceneForDay } from '../scenes'

/** Shared shell for the decorative bottom scene; picks the illustration by day. */
export default function SceneStage({ day }: { day: number }) {
  // `sceneForDay` reads a module-level registry, so the same day always yields
  // the same component reference and React does not remount between renders.
  // The rule cannot see that; a changed day SHOULD remount, and does.
  const Scene = sceneForDay(day)
  return (
    <div className="scene-stage" aria-hidden="true">
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Scene />
    </div>
  )
}
