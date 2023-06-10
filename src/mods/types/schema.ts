import { Core } from "../core/core.js"
import { Instance } from "./instance.js"

export interface QuerySchema<D, K, O extends Instance<D, K> = Instance<D, K>> {
  make(core: Core): Promise<O>
}