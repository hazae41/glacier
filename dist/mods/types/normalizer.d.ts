import { Core } from "../core";
import { State } from "./state";
export interface NormalizerMore<D = any, E = any, N extends D = D, K = any> {
    core: Core;
    root: State<D, E, N, K>;
}
export declare type Normalizer<D = any, E = any, N extends D = D, K = any> = (data: D, more: NormalizerMore<D, E, N, K>) => Promise<N>;
