import { Query } from '../../types/query.js';

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param query
 * @param interval
 */
declare function useInterval(query: Query, interval: number): void;

export { useInterval };
