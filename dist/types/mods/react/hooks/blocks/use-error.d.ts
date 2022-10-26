import { Query } from '../../types/query.js';

/**
 * Call a function on error
 * @param query
 * @param callback
 */
declare function useError<D = any, E = any, K = any>(query: Query<D, E, K>, callback: (e: E) => void): void;

export { useError };
