import { State } from "./state.js";

export type Indexer<D, F> =
  (state: State<D, F>) => Promise<void>