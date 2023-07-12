import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import type { FiberNode } from './fiber'

let workInProgress: FiberNode | null = null

function prepareFreshStack(fiber: FiberNode) {
  workInProgress = fiber
}

export function renderRoot(root: FiberNode) {
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
  fiber.memorizedProps = fiber.pendingProps
  if (next === null) {
    completeUnitOfWork(fiber)
  }
  else {
    workInProgress = next
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode = fiber
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
