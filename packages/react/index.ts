import type { Dispatcher } from './src/currentDispatcher'
import currentDispatcher, { resolveDispatcher } from './src/currentDispatcher'
import { jsxDEV } from './src/jsx'

export const useState: Dispatcher['useState'] = (initialState) => {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}

export const VINO_SECRET_INTERNAL = {
  currentDispatcher,
}

export default {
  version: '0.0.1',
  createElement: jsxDEV,
}
