import { Query } from '../../types/query.js';

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param query
 */
declare function useFetch(query: Query): void;

export { useFetch };
