import { ScrollDescriptor } from "../../../descriptors/scroll";
import { SingleDescriptor } from "../../../descriptors/single";
import { ScrollHandle } from "./scroll";
import { SingleHandle } from "./single";
export declare function use<D = any, E = any, K = any>(descriptor: SingleDescriptor<D, E, K>): SingleHandle<D, E, K>;
export declare function use<D = any, E = any, K = any>(descriptor: ScrollDescriptor<D, E, K>): ScrollHandle<D, E, K>;
