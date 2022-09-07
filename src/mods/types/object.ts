import { Mutator } from "./mutator"
import { State } from "./state"

export interface Object<D = any, E = any, N = D, K = any> {
  mutate(mutator: Mutator<D, E, N, K>): Promise<State<D, E, N, K> | undefined>
}