import { Core } from "../core";
import { Object } from "./object";
export interface Schema<D = any, E = any, K = any, O extends Object<D, E, K> = Object<D, E, K>> {
    make(core: Core): O;
}
