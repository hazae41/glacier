import { Core } from "mods/core/core.js";
import { State } from "./state.js";

export type Indexer<D, F> =
  (state: State<D, F>, more: IndexerMore) => Promise<void>

export interface IndexerMore {
  core: Core
}