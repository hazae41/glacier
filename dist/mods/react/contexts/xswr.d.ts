import { ScrollDescriptor, SingleDescriptor } from "../../descriptors";
import { ScrollInstance, SingleInstance } from "../../instances";
export declare type Creator = <D = any, E = any, K = any>(d: SingleDescriptor<D, E, K> | ScrollDescriptor<D, E, K>) => SingleInstance<D, E, K> | ScrollInstance<D, E, K>;
export declare function useXSWR(): {
    core: import("../../core").Core;
    params: import("../../index").Params<any, any, any>;
    create: Creator;
};
