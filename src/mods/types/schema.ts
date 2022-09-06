import { Core } from "../core"
import { Params } from "./params"
import { State } from "./state"

export interface Object<D = any, E = any, N = D, K = any> {
  mutate(state?: State<D, E, D, K>): Promise<State<D, E, N, K> | undefined>
}

export interface Schema<D = any, E = any, N = D, K = any> {
  make(core: Core, pparams?: Params<D, E, N, K>, initialize?: boolean): Object<D, E, N, K>
}

export class Normal<D = any, E = any, N = D, K = any> {
  constructor(
    readonly data: D,
    readonly schema: Schema<D, E, N, K>,
    readonly result?: N
  ) { }
}