import { Query } from '../../types/query.js';

/**
 * Show query in console when it changes
 * @param query
 */
declare function useDebug(query: Query, label: string): void;

export { useDebug };
