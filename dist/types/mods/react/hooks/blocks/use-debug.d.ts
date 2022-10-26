import { Query } from '../../types/query.js';

/**
 * Show handle in console when it changes
 * @param handle
 */
declare function useDebug(handle: Query, label: string): void;

export { useDebug };
