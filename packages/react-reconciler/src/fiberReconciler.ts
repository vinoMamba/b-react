import type { Container } from 'hostConfig'
import type { ReactElementType } from 'shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import { scheduleUpdateOnFiber } from './workLoop'
import type { UpdateQueue } from './updateQueue'
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue'

export function createContainer(container: Container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  const root = new FiberRootNode(container, hostRootFiber)
  // NOTE: 接入更新机制
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}

export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
  const hostRootFiber = root.current
  const update = createUpdate<ReactElementType | null>(element)
  const updateQueue = hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>
  enqueueUpdate(updateQueue, update)
  scheduleUpdateOnFiber(hostRootFiber)
}
