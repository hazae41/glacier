import { State } from "./state";
export declare type Mutator<D = any, E = any, N = D, K = any> = (previous?: State<D, E, N, K>) => State<D, E, N | D, K> | undefined;