import { Mutator } from "./mutator.js"
import { State } from "./state.js"

export interface Instance<D = unknown, K = unknown> {
  mutate(mutator: Mutator<D>): Promise<State<D> | undefined>
}