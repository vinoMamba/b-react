import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import type { ElementType, Key, Props, ReactElementType, Ref, Type } from 'shared/ReactTypes'

const ReactElement = function(type: Type, key: Key, ref: Ref, props: Props): ReactElementType {
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

/*
* babel 会将 <App key="key" props={props} ref={ref}>1111</App> 转换为 jsx(App, {key: 'key', props: props, ref: ref}, '1111')
*
* 最新的会将key 作为第三个参数，见： https://babeljs.io/repl#?browsers=defaults&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=DwQQDmAEDWCmCeBeARHezIHsB2BjANgJa7SIDeAFgIbYAm-sAwkSQL6QBOsAZuV9-zIA6EWA6YwAZ3YAXeGFgoqy5AD4AUJEjBahAG6qAjMAD0ug5u3nVAJlPX1p8GFVA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react%2Ctypescript&prettier=false&targets=&version=7.19.5&externalPlugins=&assumptions=%7B%7D
*/

export function jsx(type: ElementType, config: any, ...maybeChildren: any) {
  let key: Key = null
  const props: Props = {}
  let ref: Ref = null
  for (const prop in config) {
    const val = config[prop]
    if (prop === 'key') {
      if (val !== undefined) {
        key = `${val}`
      }
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
