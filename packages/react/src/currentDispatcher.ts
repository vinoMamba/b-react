import type { Action } from 'shared/ReactTypes'

export interface Dispatcher {
  useState: <T>(initialState: () => T | T) => [T, Dispatch<T>]
}

export type Dispatch<State> = (action: Action<State>) => void

const currentDispatcher: { current: Dispatcher | null } = {
  current: null,
}

export function resolveDispatcher() {
  const dispatcher = currentDispatcher.current
  if (dispatcher === null) {
    throw new Error('Hooks 只能在函数组件中执行')
  }
  return dispatcher
}

export default currentDispatcher
