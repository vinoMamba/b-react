import internals from 'shared/internals'
import type { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import type { Action } from 'shared/ReactTypes'
import type { FiberNode } from './fiber'
import type { UpdateQueue } from './updateQueue'
import { createUpdate, createUpdateQueue, enqueueUpdate, processUpdateQueue } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

const { currentDispatcher } = internals

let currentlyRenderingFiber: FiberNode | null = null
let wipHook: Hook | null = null
let currentHook: Hook | null = null

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
}

export function renderWithHooks(wip: FiberNode) {
  currentlyRenderingFiber = wip
  wip.memoizedState = null

  const current = wip.alternate
  if (current !== null) {
    currentDispatcher.current = HooksDispatcherOnUpdate
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
  hook.memoizedState = memoizedState

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)
  queue.dispatch = dispatch
  return [memoizedState, dispatch]
}

function updateState<State>(): [State, Dispatch<State>] {
  const hook = updateWipHook()
  const queue = hook.updateQueue as UpdateQueue<State>
  const pending = queue.shared.pending

  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending)
    hook.memoizedState = memoizedState
  }

  return [hook.memoizedState, queue.dispatch as Dispatch<State>]
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

function updateWipHook(): Hook {
  let nextCurrentHook: Hook | null
  if (currentHook === null) {
    const current = currentlyRenderingFiber?.alternate
    if (current !== null) {
      nextCurrentHook = current?.memoizedState
    }
    else {
      nextCurrentHook = null
    }
  }
  else {
    // 后续的hook
    nextCurrentHook = currentHook.next
  }

  if (nextCurrentHook == null) {
    throw new Error(`组件${currentlyRenderingFiber?.type} 本次执行时的hook比上一次的多`)
  }

  currentHook = nextCurrentHook as Hook
  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,
    updateQueue: currentHook.updateQueue,
    next: null,
  }
  if (wipHook === null) {
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件内调用hook')
    }
    else {
      wipHook = newHook
      currentlyRenderingFiber.memoizedState = wipHook
    }
  }
  else {
    wipHook.next = newHook
    wipHook = newHook
  }
  return newHook
}
