import type { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes'
import type { Container } from 'hostConfig'
import type { WorkTag } from './workTags'
import { FunctionComponent, HostComponent } from './workTags'
import type { Flags } from './fiberFlags'
import { NoFlags } from './fiberFlags'

export class FiberNode {
  type: any
  tag: WorkTag
  pendingProps: Props
  key: Key
  stateNode: any
  ref: Ref

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null
  memoizedState: any
  alternate: FiberNode | null
  flags: Flags
  subTreeFlags: Flags
  updateQueue: unknown

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag
    this.key = key
    this.stateNode = null
    this.type = null

    this.return = null
    this.sibling = null
    this.child = null
    this.index = 0

    this.ref = null

    this.pendingProps = pendingProps
    this.memoizedProps = null // 确定之后的Props
    this.memoizedState = null
    this.updateQueue = null

    this.alternate = null

    // 副作用
    this.flags = NoFlags
    this.subTreeFlags = NoFlags
  }
}

export class FiberRootNode {
  container: Container
  current: FiberNode
  finishedWork: FiberNode | null
  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container
    this.current = hostRootFiber
    hostRootFiber.stateNode = this
    this.finishedWork = null
  }
}

export function createWorkInProgress(current: FiberNode, pendingProps: Props): FiberNode {
  let wip = current.alternate
  if (wip === null) {
    // NOTE: mount
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.type = current.type
    wip.stateNode = current.stateNode

    wip.alternate = current
    current.alternate = wip
  }
  else {
    // NOTE: update
    wip.pendingProps = pendingProps
    wip.flags = NoFlags
    wip.subTreeFlags = NoFlags
  }

  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState

  return wip
}

export function createFiberFromElement(element: ReactElementType): FiberNode {
  const { type, key, props } = element
  let fiberTag: WorkTag = FunctionComponent
  if (typeof type === 'string') {
    fiberTag = HostComponent
  }
  else if (typeof type !== 'function' && __DEV__) {
    console.warn('未定义的type类型', element)
  }
  const fiber = new FiberNode(fiberTag, props, key)
  fiber.tag = fiberTag
  return fiber
}
