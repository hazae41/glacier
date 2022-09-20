import { State } from "./state";
export declare type Mutator<D extends N = any, E = any, N = D, K = any> = (previous?: State<D, E, N, K>) => State<D, E, D | N, K> | undefined;
