import { State } from './state.js';

declare type Mutator<D = any, E = any, K = any> = (previous?: State<D, E, K>) => State<D, E, K> | undefined;

export { Mutator };
