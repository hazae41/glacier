import { Core } from "../../core";
import { Params } from "../../index";
export declare type Maker = <T>(x: {
    make(core: Core, params: Params): T;
}) => T;
export declare function useXSWR(): {
    core: Core;
    params: Params<any, any, any>;
    make: Maker;
};
