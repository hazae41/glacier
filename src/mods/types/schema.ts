import { Core } from "../core/core.js"
import { Instance } from "./instance.js"

export interface Schema<D = any, E = any, K = any, O extends Instance<D, E, K> = Instance<D, E, K>> {
  make(core: Core): O
}