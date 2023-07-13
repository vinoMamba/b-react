export type Type = any
export type Key = any
export type Ref = any
export type Props = any
export type ElementType = any

export interface ReactElementType {
  $$typeof: symbol | string
  type: ElementType
  key: Key
  props: Props
  ref: Ref
  __mark: string
}

export type Action<State> = State | ((prevState: State) => State) // prevState: 之前的state 通过函数返回新的state。 Pure!
