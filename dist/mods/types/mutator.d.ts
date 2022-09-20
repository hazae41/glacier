import { State } from "./state";
export declare type Mutator<D = any, E = any, K = any> = (previous?: State<D, E, K>) => State<D, E, K> | undefined;
