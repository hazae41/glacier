import { Optional } from "@hazae41/option"
import { Fetched } from "index.js"
import { Promiseable } from "libs/promises/promises.js"
import { State } from "./state.js"

export type Mutator<D = unknown> =
  (previous: State<D>) => Promiseable<Optional<Fetched<D>>>

export type Setter<D = unknown> =
  (previous: State<D>) => Promiseable<State<D>>