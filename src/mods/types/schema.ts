import { ScrollQueryInstance } from "mods/scroll/instance.js"
import { SimpleQueryInstance } from "mods/single/instance.js"
import { Core } from "../core/core.js"

export type Instance<K, D, F> =
  | SimpleQueryInstance<K, D, F>
  | ScrollQueryInstance<K, D, F>

export interface QuerySchema<K, D, F, O extends Instance<K, D, F>> {
  make(core: Core): Promise<O>
}