import { Result } from "@hazae41/result";
import { State } from "./state.js";

export type Indexer<D, F> =
  (states: States<D, F>) => Promise<Result<void, Error>>

export interface States<D, F> {
  current: State<D, F>
  previous?: State<D, F>
}