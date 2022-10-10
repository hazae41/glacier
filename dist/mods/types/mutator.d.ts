import { State } from "./state.js";
export declare type Mutator<D = any, E = any, K = any> = (previous?: State<D, E, K>) => State<D, E, K> | undefined;
