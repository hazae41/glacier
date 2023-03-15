import { Promiseable } from "libs/promises/promises.js"
import { State } from "mods/types/state.js"

export type Mutator<D = unknown> =
  (previous?: State<D>) => Promiseable<State<D> | undefined>
