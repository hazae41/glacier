import { Awaitable } from "libs/promises/promises.js"
import { FetchedInit } from "mods/fetched/fetched.js"

export type Fetcher<K, D, F> =
  (key: K, init: RequestInit) => Awaitable<FetchedInit<D, F>>
