import { Object } from "../../types/object.js";
import { Schema } from "../../types/schema.js";
export declare type Maker = <D = any, E = any, K = any, O extends Object<D, E, K> = Object<D, E, K>>(schema: Schema<D, E, K, O>) => O;
export declare function useXSWR(): {
    core: import("../../core.js").Core;
    make: Maker;
};
