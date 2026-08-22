import { useSyncExternalStore } from 'react'

const KEY = 'retire-day:progress'

export interface State {
  opened: number[]
}

const initial: State = { opened: [] }

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<State>
    return {
      opened: Array.isArray(parsed.opened)
        ? parsed.opened.filter((n): n is number => typeof n === 'number')
        : [],
    }
  } catch {
    return initial
  }
}

let state = read()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function write(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage may be unavailable/full — keep in-memory state */
  }
  emit()
}

export function markOpened(day: number) {
  if (state.opened.includes(day)) return
  write({ ...state, opened: [...state.opened, day].sort((a, b) => a - b) })
}

export function resetProgress() {
  write({ ...initial })
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}
