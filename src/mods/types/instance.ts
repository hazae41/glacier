import { Mutator } from "./mutator.js"
import { FullState } from "./state.js"

export interface Instance<D = unknown, K = unknown> {
  mutate(mutator: Mutator<D>): Promise<FullState<D> | undefined>
}