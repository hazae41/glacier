import { ScrollSchema } from "../../../scroll/schema.js";
import { SingleSchema } from "../../../single/schema.js";
import { DependencyList } from "react";
import { ScrollHandle } from "./scroll.js";
import { SingleHandle } from "./single.js";
export declare function use<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...deps: L) => SingleSchema<D, E, K>, deps: L): SingleHandle<D, E, K>;
export declare function use<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...deps: L) => ScrollSchema<D, E, K>, deps: L): ScrollHandle<D, E, K>;
