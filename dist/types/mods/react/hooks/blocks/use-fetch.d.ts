import { Handle } from '../../types/handle.js';

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
declare function useFetch(handle: Handle): void;

export { useFetch };
