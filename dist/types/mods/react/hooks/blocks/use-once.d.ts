import { Query } from '../../types/query.js';

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param query
 * @example You want to get some data once and share it in multiple components
 */
declare function useOnce(query: Query): void;

export { useOnce };
