import { Mutator } from "./mutator"
import { State } from "./state"

export interface Object<D = any, E = any, K = any> {
  mutate(mutator: Mutator<D, E, K>): Promise<State<D, E, K> | undefined>
}