import { Core } from "../core";
import { Object } from "./object";
import { Params } from "./params";
export interface Schema<D = any, E = any, N = D, K = any, O extends Object<D, E, N, K> = Object<D, E, N, K>> {
    make(core: Core, pparams?: Params<D, E, N, K>, initialize?: boolean): O;
}
