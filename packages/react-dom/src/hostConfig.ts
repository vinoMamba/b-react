import type { FiberNode } from 'react-reconciler/src/fiber'
import { HostText } from 'react-reconciler/src/workTags'

export type Container = Element
export type Instance = Element
export type TextInstance = Text

export function createInstance(type: string, _props: any): Instance {
  // TODO: props
  const element = document.createElement(type)
  return element
}

export function appendInitialChild(parent: Instance | Container, child: Instance) {
  parent.appendChild(child)
}

export function createTextInstance(content: string) {
  return document.createTextNode(content)
}

export const appendChildToContainer = appendInitialChild

export function commitUpdate(fiber: FiberNode) {
  switch (fiber.tag) {
    case HostText:
      return commitTextUpdate(fiber.stateNode, fiber.memoizedProps.content)
    default:
      if (__DEV__) {
        console.warn('未实现的Update 类型')
      }
      break
  }
}

export function commitTextUpdate(textInstance: TextInstance, content: string) {
  textInstance.textContent = content
}

export function removeChild(child: Instance | TextInstance, container: Container) {
  container.removeChild(child)
}
