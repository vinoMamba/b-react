import { beginWork } from './beginWork'
import { commitMutationEffects } from './commitWork'
import { completeWork } from './completeWork'
import type { FiberNode, FiberRootNode } from './fiber'
import { createWorkInProgress } from './fiber'
import { MutationMarks, NoFlags } from './fiberFlags'
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
    // NOTE: 对应的是 this 也就是 FiberRootNode,查看 FiberRootNode 的构造函数
    return node.stateNode
  }
  return null
}

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {})
}

// NOTE: 入口
function renderRoot(root: FiberRootNode) {
  prepareFreshStack(root)
  do {
    try {
      workLoop()
      break
    }
    catch (e) {
      if (__DEV__) {
        console.warn('workLoop发生错误', e)
      }
      workInProgress = null
    }
  } while (true)

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork
  if (finishedWork === null) {
    return
  }
  if (__DEV__) {
    console.warn('commit 阶段开始', finishedWork)
  }

  root.finishedWork = null

  const subTreeHasEffect = (finishedWork.subTreeFlags & MutationMarks) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMarks) !== NoFlags

  if (subTreeHasEffect || rootHasEffect) {
    commitMutationEffects(finishedWork)
    root.current = finishedWork
  }
  else {
    root.current = finishedWork
  }
}

function workLoop() {
  while (workInProgress !== null) {
    perforUnitOfWork(workInProgress)
  }
}

function perforUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber)
  // NOTE: why
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
