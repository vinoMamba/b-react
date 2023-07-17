import type { Container } from 'hostConfig'
import { appendChildToContainer } from 'hostConfig'
import type { FiberNode, FiberRootNode } from './fiber'
import { MutationMarks, NoFlags, Placement } from './fiberFlags'
import { HostComponent, HostRoot, HostText } from './workTags'

let nexrEffect: FiberNode | null = null

export function commitMutationEffects(finishedWork: FiberNode) {
  nexrEffect = finishedWork
  while (nexrEffect !== null) {
    const child = nexrEffect.child
    if ((nexrEffect.subTreeFlags & MutationMarks) !== NoFlags && child !== null) {
      nexrEffect = child
    }
    else {
      up: while (nexrEffect !== null) {
        commitMutationEffectsOnFiber(nexrEffect)
        const sibling = nexrEffect.sibling

        if (sibling !== null) {
          nexrEffect = sibling
          break up
        }
        nexrEffect = nexrEffect.return
      }
    }
  }
}

function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
  const flags = finishedWork.flags
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    finishedWork.flags &= ~Placement
  }
  // TODO: other flags
}

function commitPlacement(finishedWork: FiberNode) {
  if (__DEV__) {
    console.warn('执行placement操作', finishedWork)
  }
  const hostParent = getHostParent(finishedWork)
  appendPlacmentNodeIntoContaier(finishedWork, hostParent)
}

function getHostParent(fiber: FiberNode) {
  let parent = fiber.return
  while (parent) {
    const parentTag = parent.tag
    if (parentTag === HostComponent) {
      return parent.stateNode as Container
    }
    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container
    }
    parent = parent.return
  }
  if (__DEV__) {
    console.warn('未找到 host parent')
  }
}

function appendPlacmentNodeIntoContaier(finishedWork: FiberNode, hostParent: Container) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(finishedWork.stateNode, hostParent)
  }
  const child = finishedWork.child
  if (child !== null) {
    appendPlacmentNodeIntoContaier(child, hostParent)

    let sibling = child.sibling
    while (sibling !== null) {
      appendPlacmentNodeIntoContaier(child, hostParent)
      sibling = sibling.sibling
    }
  }
}
