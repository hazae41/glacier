import { Core } from "../core.js";
import { State } from "./state.js";
export interface NormalizerMore<D = any, E = any, K = any> {
    core: Core;
    shallow: boolean;
    root: State<D, E, K>;
}
export declare type Normalizer<D = any, E = any, K = any> = (data: D, more: NormalizerMore<D, E, K>) => Promise<D>;
