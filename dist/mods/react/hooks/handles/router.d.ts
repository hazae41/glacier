import { ScrollSchema } from "../../../scroll";
import { SingleSchema } from "../../../single";
import { ScrollHandle } from "./scroll";
import { SingleHandle } from "./single";
export declare function use<D = any, E = any, K = any>(schema: SingleSchema<D, E, K>): SingleHandle<D, E, K>;
export declare function use<D = any, E = any, K = any>(schema: ScrollSchema<D, E, K>): ScrollHandle<D, E, K>;
