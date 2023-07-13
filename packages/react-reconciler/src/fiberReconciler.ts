import type { Container } from 'hostConfig'
import type { UpdateQueue } from 'react-reconciler/updateQueue'
import { createUpdate, createUpdateQueue, enqueueUpdate } from 'react-reconciler/updateQueue'
import type { ReactElementType } from 'shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import { scheduleUpdateOnFiber } from './workLoop'

export function createContainer(container: Container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  const root = new FiberRootNode(container, hostRootFiber)
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}

export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
  const hostRootFiber = root.current
  const update = createUpdate<ReactElementType | null>(element)
  const updateQueue = hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>
  enqueueUpdate(updateQueue, update)
  scheduleUpdateOnFiber(hostRootFiber)
  return element
}
