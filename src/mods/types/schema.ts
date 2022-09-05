import { Core } from "../core"
import { Params } from "./params"
import { State } from "./state"

export interface Object<D = any, E = any, K = any> {
  mutate(state?: State<D, E>): Promise<State<D, E> | undefined>
}

export interface Schema<D = any, E = any, K = any> {
  make(core: Core, pparams?: Params, initialize?: boolean): Object<D, E, K>
}