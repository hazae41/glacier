import { Nullable, Option } from "@hazae41/option"
import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/result/fetched.js"
import { State } from "./state.js"

export type Mutator<D, F> =
  (previous: State<D, F>) => Promiseable<Option<Nullable<FetchedInit<D, F>>>>

export type Setter<D, F> =
  (previous: State<D, F>) => Promiseable<State<D, F>>