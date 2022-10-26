import { Query } from '../../types/query.js';

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param query
 */
declare function useMount(query: Query): void;

export { useMount };
