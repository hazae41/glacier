import { State } from "./state"

export interface Object<D = any, E = any, N = D, K = any> {
  mutate(state?: State<D, E, D, K>): Promise<State<D, E, N, K> | undefined>
}