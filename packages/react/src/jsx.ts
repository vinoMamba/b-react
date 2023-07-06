import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import type { ElementType, Key, Props, ReactElementType, Ref, Type } from 'shared/ReactTypes'

const ReactElement = function (type: Type, key: Key, ref: Ref, props: Props): ReactElementType {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'vino',
  }
  return element
}
export function jsx(type: ElementType, config: any, ...maybeChildren: any) {
  let key: Key = null
  const props: Props = {}
  let ref: Ref = null
  for (const prop in props) {
    const val = config[prop]
    if (val !== undefined) {
      key = `${val}`
      continue
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val
      }
      continue
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val
    }

    const maybeChildrenLength = maybeChildren.length
    if (maybeChildrenLength === 1) {
      props.children = maybeChildren[0]
    }
    else {
      props.children = maybeChildren
    }
  }
  return ReactElement(type, key, ref, props)
}
