import { Core } from "../core";
import { State } from "./state";
export interface NormalizerMore<D = any, E = any, K = any> {
    core: Core;
    shallow: boolean;
    root: State<D, E, K>;
}
export declare type Normalizer<D = any, E = any, K = any> = (data: D, more: NormalizerMore<D, E, K>) => Promise<D>;
