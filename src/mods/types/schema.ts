import { Core } from "../core/core.js"
import { Instance } from "./instance.js"

export interface Schema<D, K, O extends Instance<D, K> = Instance<D, K>> {
  make(core: Core): O
}