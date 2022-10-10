import { Mutator } from "./mutator.js";
import { State } from "./state.js";
export interface Object<D = any, E = any, K = any> {
    mutate(mutator: Mutator<D, E, K>): Promise<State<D, E, K> | undefined>;
}
