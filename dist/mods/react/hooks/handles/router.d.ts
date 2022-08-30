import { ScrollSchema } from "../../../scroll";
import { SingleSchema } from "../../../single";
import { DependencyList } from "react";
import { ScrollHandle } from "./scroll";
import { SingleHandle } from "./single";
export declare function use<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...params: L) => SingleSchema<D, E, K>, deps: L): SingleHandle<D, E, K>;
export declare function use<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...params: L) => ScrollSchema<D, E, K>, deps: L): ScrollHandle<D, E, K>;
