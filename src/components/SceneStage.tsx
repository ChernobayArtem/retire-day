import { sceneForDay } from '../scenes'

/** Shared shell for the decorative bottom scene; picks the illustration by day. */
export default function SceneStage({ day }: { day: number }) {
  const Scene = sceneForDay(day)
  return (
    <div className="scene-stage" aria-hidden="true">
      <Scene />
    </div>
  )
}
