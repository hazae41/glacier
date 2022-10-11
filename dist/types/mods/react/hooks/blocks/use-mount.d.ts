import { Handle } from '../../types/handle.js';

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
declare function useMount(handle: Handle): void;

export { useMount };
