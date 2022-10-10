import { Core } from "../core.js"
import { Object } from "./object.js"

export interface Schema<D = any, E = any, K = any, O extends Object<D, E, K> = Object<D, E, K>> {
  make(core: Core): O
}