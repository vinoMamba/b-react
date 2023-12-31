import type { Container } from 'hostConfig'
import { appendInitialChild, createInstance, createTextInstance } from 'hostConfig'
import type { FiberNode } from './fiber'
import { FunctionComponent, HostComponent, HostRoot, HostText } from './workTags'
import { NoFlags, Update } from './fiberFlags'

function markUpdate(fiber: FiberNode) {
  fiber.flags |= Update
}

export function completeWork(wip: FiberNode) {
  const newProps = wip.pendingProps
  const current = wip.alternate
  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // TODO: update
      }
      else {
        // mount
        const instance = createInstance(wip.type, newProps)
        appendAllChildren(instance, wip)
        wip.stateNode = instance
      }
      bubbleProperties(wip)
      return null
    case HostText:
      if (current !== null && wip.stateNode) {
        // TODO: update
        const oldText = current.memoizedProps.content
        const newtext = newProps.content
        if (oldText !== newtext) {
          markUpdate(wip)
        }
      }
      else {
        const instance = createTextInstance(newProps.content)
        wip.stateNode = instance
      }
      bubbleProperties(wip)
      return null
    case HostRoot:
      bubbleProperties(wip)
      return null
    case FunctionComponent:
      bubbleProperties(wip)
      return null
    default:
      if (__DEV__) {
        console.warn('未处理的complete 的情况', wip.tag)
      }
      break
  }
}

function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child
  while (node !== null) {
    if (node?.tag === HostComponent || node?.tag === HostText) {
      appendInitialChild(parent, node?.stateNode)
    }
    else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }
    if (node === wip) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return
      }
      node = node?.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function bubbleProperties(wip: FiberNode) {
  let subTreeFlags = NoFlags
  let child = wip.child

  while (child !== null) {
    subTreeFlags |= child.subTreeFlags
    subTreeFlags |= child.flags

    child.return = wip
    child = child.sibling
  }
  wip.subTreeFlags |= subTreeFlags
}
