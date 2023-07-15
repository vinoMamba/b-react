import type { ReactElementType } from 'shared/ReactTypes'
import type { FiberNode } from './fiber'
import type { Update, UpdateQueue } from './updateQueue'
import { processUpdateQueue } from './updateQueue'
import { HostComponent, HostRoot, HostText } from './workTags'
import { mountChildFibers, reconcileChildFibers } from './childFibers'

export function beginWork(wip: FiberNode) {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip)
    case HostComponent:
      return updateHostComponent(wip)
    case HostText:
      return null
    default:
      if (__DEV__) {
        console.warn('beginWork 未实现的类型')
      }
      break
  }
  return wip
}

function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memoizedState
  const updateQueue = wip.updateQueue as UpdateQueue<Element>
  const pending = updateQueue.shared.pending as Update<Element>
  updateQueue.shared.pending = null
  const { memoizedState } = processUpdateQueue(baseState, pending)
  wip.memoizedState = memoizedState

  const nextChildren = wip.memoizedState
  reconcilerChilren(wip, nextChildren)
  return wip.child
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps
  const nextChildren = nextProps.nextChildren
  reconcilerChilren(wip, nextChildren)
  return wip.child
}

function reconcilerChilren(wip: FiberNode, children: ReactElementType) {
  const current = wip.alternate

  if (current !== null) {
    // update
    wip.child = reconcileChildFibers(wip, current.child, children)
  }
  else {
    wip.child = mountChildFibers(wip, null, children)
  }
}
