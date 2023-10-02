import { Nullable, Option } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"
import { State } from "./state.js"

export type Mutator<D, F> =
  (previous: State<D, F>) => Promiseable<Result<Option<Nullable<FetchedInit<D, F>>>, Error>>

export type Setter<D, F> =
  (previous: State<D, F>) => Promiseable<Result<State<D, F>, Error>>