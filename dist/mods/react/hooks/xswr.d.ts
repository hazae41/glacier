import { Object } from "../../types/object";
import { Schema } from "../../types/schema";
export declare type Maker = <D extends N = any, E = any, N = D, K = any, O extends Object<D, E, N, K> = Object<D, E, N, K>>(schema: Schema<D, E, N, K, O>) => O;
export declare function useXSWR(): {
    core: import("../../core").Core;
    params: import("../../index").Params<any, any, any, any>;
    make: Maker;
};
