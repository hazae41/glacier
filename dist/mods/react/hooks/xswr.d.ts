import { Object } from "../../types/object";
import { Schema } from "../../types/schema";
export declare type Maker = <T>(schema: Schema<T>, init?: boolean) => Object<T>;
export declare function useXSWR(): {
    core: import("../../core").Core;
    params: import("../../index").Params<any, any, any, any>;
    make: Maker;
};
