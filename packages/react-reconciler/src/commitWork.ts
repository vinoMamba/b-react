import type { Container } from 'hostConfig'
import { appendChildToContainer, commitUpdate, removeChild } from 'hostConfig'
import type { FiberNode, FiberRootNode } from './fiber'
import { ChildDeletion, MutationMarks, NoFlags, Placement, Update } from './fiberFlags'
import { FunctionComponent, HostComponent, HostRoot, HostText } from './workTags'

let nextEffect: FiberNode | null = null

export function commitMutationEffects(finishedWork: FiberNode) {
  nextEffect = finishedWork
  while (nextEffect !== null) {
    const child: FiberNode | null = nextEffect.child

    if ((nextEffect.subTreeFlags & MutationMarks) !== NoFlags && child !== null) {
      nextEffect = child
    }

    else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect)
        const sibling: FiberNode | null = nextEffect.sibling

        if (sibling !== null) {
          nextEffect = sibling
          break up
        }

        nextEffect = nextEffect.return
      }
    }
  }
}

function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
  const flags = finishedWork.flags

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    // 移除Placement
    finishedWork.flags &= ~Placement
  }

  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork)
    finishedWork.flags &= ~Update
  }

  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions
    if (deletions !== null) {
      deletions.forEach((childToDelete) => {
        commitDeletion(childToDelete)
      })
    }
    finishedWork.flags &= ~ChildDeletion
  }
  // TODO: other flags
}

function commitDeletion(childToDelete: FiberNode) {
  let rootHostNode: FiberNode | null = null
  commitNestedComponent(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        if (rootHostNode === null) {
          rootHostNode = unmountFiber
        }
        return
      case HostText:
        if (rootHostNode === null) {
          rootHostNode = unmountFiber
        }
        return
      case FunctionComponent:
        return
      default:
        if (__DEV__) {
          console.warn('未处理的unmount类型', unmountFiber)
        }
    }
  })

  if (rootHostNode !== null) {
    const hostParent = getHostParent(childToDelete)
    if (hostParent !== null) {
      removeChild((rootHostNode as FiberNode).stateNode, hostParent)
    }
  }
  childToDelete.return = null
  childToDelete.child = null
}

function commitNestedComponent(root: FiberNode, onCommitUnmount: (fiber: FiberNode) => void) {
  let node = root
  while (true) {
    onCommitUnmount(node)
    if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === root) {
      return
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function commitPlacement(finishedWork: FiberNode) {
  if (__DEV__) {
    console.warn('执行placement操作', finishedWork)
  }
  const hostParent = getHostParent(finishedWork)
  if (hostParent !== null) {
    appendPlacmentNodeIntoContaier(finishedWork, hostParent)
  }
}

function getHostParent(fiber: FiberNode): Container | null {
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
  return null
}

function appendPlacmentNodeIntoContaier(finishedWork: FiberNode, hostParent: Container) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(hostParent, finishedWork.stateNode)
    return
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
