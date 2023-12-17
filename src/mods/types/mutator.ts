import { Nullable, Option } from "@hazae41/option"
import { Awaitable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"
import { State } from "./state.js"

export type Mutator<D, F> =
  (previous: State<D, F>) => Awaitable<Option<Nullable<FetchedInit<D, F>>>>

export type Setter<D, F> =
  (previous: State<D, F>) => Awaitable<State<D, F>>