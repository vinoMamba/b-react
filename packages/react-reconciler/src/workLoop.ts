import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import type { FiberNode, FiberRootNode } from './fiber'
import { createWorkInProgress } from './fiber'
import { HostRoot } from './workTags'

let workInProgress: FiberNode | null = null

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // TODO: schedule
  const root = markUpdateFromFiberToRoot(fiber)
  renderRoot(root)
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber
  let parent = node.return
  while (parent !== null) {
    node = parent
    parent = node.return
  }
  if (node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {})
}

// 入口
function renderRoot(root: FiberRootNode) {
  prepareFreshStack(root)
  do {
    try {
      workLoop()
      break
    }
    catch (e) {
      console.warn('workLoop发生错误', e)
      workInProgress = null
    }
  } while (true)
}

function workLoop() {
  while (workInProgress !== null) {
    perforUnitOfWork(workInProgress)
  }
}

function perforUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber)
  // TODO: why
  fiber.memoizedProps = fiber.pendingProps
  if (next === null) {
    completeUnitOfWork(fiber)
  }
  else {
    workInProgress = next
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber
  do {
    completeWork(node)
    const sibling = node.sibling
    if (sibling !== null) {
      workInProgress = sibling
      return
    }
    else {
      node = node.return
      workInProgress = node
    }
  } while (node !== null)
}
