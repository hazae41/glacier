import { Core } from "mods/core/core.js";
import { State } from "./state.js";

export type Indexer<D, F> =
  (states: States<D, F>, more: IndexerMore) => Promise<void>

export interface States<D, F> {
  current: State<D, F>
  previous?: State<D, F>
}

export interface IndexerMore {
  core: Core
}