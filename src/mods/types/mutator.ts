import { FetchedInit } from "index.js"
import { Optional } from "libs/types/optional.js"
import { State } from "./state.js"

export type Mutator<D = unknown> =
  (previous?: State<D>) => Optional<FetchedInit<D>>