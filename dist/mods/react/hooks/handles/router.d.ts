import { ScrollSchema } from "../../../scroll";
import { SingleSchema } from "../../../single";
import { DependencyList } from "react";
import { ScrollHandle } from "./scroll";
import { SingleHandle } from "./single";
export declare function use<D = any, E = any, N extends D = D, K = any, L extends DependencyList = []>(factory: (...deps: L) => SingleSchema<D, E, N, K>, deps: L): SingleHandle<D, E, N, K>;
export declare function use<D = any, E = any, N extends D = D, K = any, L extends DependencyList = []>(factory: (...deps: L) => ScrollSchema<D, E, N, K>, deps: L): ScrollHandle<D, E, N, K>;
