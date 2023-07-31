import internals from 'shared/internals'
import type { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import type { Action } from 'shared/ReactTypes'
import type { FiberNode } from './fiber'
import type { UpdateQueue } from './updateQueue'
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

const { currentDispatcher } = internals

let currentlyRenderingFiber: FiberNode | null = null
let wipHook: Hook | null = null

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
}

export function renderWithHooks(wip: FiberNode) {
  currentlyRenderingFiber = wip
  wip.memoizedState = null

  const current = wip.alternate
  if (current !== null) {
  }
  else {
    currentDispatcher.current = HooksDispatcherOnMount
  }

  const Component = wip.type
  const props = wip.pendingProps
  const children = Component(props)

  currentlyRenderingFiber = null
  return children
}

function mountState<State>(initialState: () => State | State): [State, Dispatch<State>] {
  const hook = mountWipHook()
  let memoizedState
  if (initialState instanceof Function) {
    memoizedState = initialState()
  }
  else {
    memoizedState = initialState
  }

  const queue = createUpdateQueue<State>()
  hook.updateQueue = queue

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)
  queue.dispatch = dispatch
  return [memoizedState, dispatch]
}

function dispatchSetState<State>(fiber: FiberNode, updateQueue: UpdateQueue<State>, action: Action<State>) {
  const update = createUpdate(action)
  enqueueUpdate(updateQueue, update)
  scheduleUpdateOnFiber(fiber)
}

function mountWipHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  }
  if (wipHook === null) {
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件内调用hook')
    }
    else {
      wipHook = hook
      currentlyRenderingFiber.memoizedState = wipHook
    }
  }
  else {
    wipHook.next = hook
    wipHook = hook
  }
  return hook
}
