import { Core } from "../core"
import { Object } from "./object"

export interface Schema<D = any, E = any, N extends D = D, K = any, O extends Object<D, E, N, K> = Object<D, E, N, K>> {
  make(core: Core): O
}