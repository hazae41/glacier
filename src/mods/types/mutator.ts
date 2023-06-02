import { Option } from "@hazae41/option"
import { FetchedInit } from "index.js"
import { State } from "./state.js"

export type Mutator<D = unknown> =
  (previous: Option<State<D>>) => Option<FetchedInit<D>>