import { Query } from '../../types/query.js';
import { State } from '../../../types/state.js';

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query
 * @param state
 */
declare function useFallback<D = any, E = any, K = any>(query: Query<D, E, K>, state?: State<D, E, K>): void;

export { useFallback };
