import { ScrollSchema } from '../../../scroll/schema.js';
import { SingleSchema } from '../../../single/schema.js';
import { DependencyList } from 'react';
import { ScrollQuery } from './scroll.js';
import { SingleQuery } from './single.js';

declare function useQuery<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...deps: L) => SingleSchema<D, E, K>, deps: L): SingleQuery<D, E, K>;
declare function useQuery<D = any, E = any, K = any, L extends DependencyList = []>(factory: (...deps: L) => ScrollSchema<D, E, K>, deps: L): ScrollQuery<D, E, K>;

export { useQuery };
