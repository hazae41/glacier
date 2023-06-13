import { Option, Optional } from "@hazae41/option"
import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/result/fetched.js"
import { State } from "./state.js"

export type Mutator<D = unknown> =
  (previous: State<D>) => Promiseable<Option<Optional<FetchedInit<D>>>>

export type Setter<D = unknown> =
  (previous: State<D>) => Promiseable<State<D>>