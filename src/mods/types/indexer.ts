import { Awaitable } from "libs/promises/promises.js";
import { State } from "./state.js";

export type Indexer<D, F> =
  (states: States<D, F>) => Awaitable<void>

export interface States<D, F> {
  readonly current: State<D, F>
  readonly previous?: State<D, F>
}