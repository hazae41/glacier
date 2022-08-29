import { SingleDescriptor } from "../../descriptors";
import { SingleInstance } from "../../index";
declare type Creator = <D = any, E = any, K = any>(d: SingleDescriptor<D, E, K>) => SingleInstance<D, E, K>;
export declare function useXSWR(): {
    core: import("../../index").Core;
    params: import("../../index").Params<any, any, any>;
    create: Creator;
};
export {};
