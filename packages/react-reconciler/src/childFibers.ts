import type { ReactElementType } from 'shared/ReactTypes'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { FiberNode, createFiberFromElement } from './fiber'
import { HostText } from './workTags'
import { Placement } from './fiberFlags'

function ChildReconcile(shouleTrackEffects: boolean) {
  function reconcilerSingleElement(returnFiber: FiberNode, _currentFiber: FiberNode | null, element: ReactElementType) {
    const fiber = createFiberFromElement(element)
    fiber.return = returnFiber
    return fiber
  }

  function reconcileSingleTextNode(returnFiber: FiberNode, _currentFiber: FiberNode | null, content: string | number) {
    const fiber = new FiberNode(HostText, { content }, null)
    fiber.return = returnFiber
    return fiber
  }

  function placeSingleChild(fiber: FiberNode) {
    // NOTE: 刚创建的fiber 的 alternate 为null
    if (shouleTrackEffects && fiber.alternate === null) {
      fiber.flags |= Placement
    }
    return fiber
  }

  return function reconcilerChildFibers(returnFiber: FiberNode, currentFiber: FiberNode | null, newChild: ReactElementType) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcilerSingleElement(returnFiber, currentFiber, newChild))
        default:
          if (__DEV__) {
            console.warn('未实现的reconcile 类型', newChild)
          }
          break
      }
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild))
    }
    if (__DEV__) {
      console.warn('未实现的reconcile 类型', newChild)
    }
    return null
  }
}

export const reconcileChildFibers = ChildReconcile(true)
export const mountChildFibers = ChildReconcile(false)
