import { Core } from "../core";
import { Object } from "./object";
import { Params } from "./params";
export interface Schema<D = any, E = any, N = D, K = any> {
    make(core: Core, pparams?: Params<D, E, N, K>, initialize?: boolean): Object<D, E, N, K>;
}
