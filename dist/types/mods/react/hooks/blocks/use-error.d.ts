import { Handle } from '../../types/handle.js';

/**
 * Call a function on error
 * @param handle
 * @param callback
 */
declare function useError<D = any, E = any, K = any>(handle: Handle<D, E, K>, callback: (e: E) => void): void;

export { useError };
