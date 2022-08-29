import { Handle } from "../handles";
/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
export declare function useMount(handle: Handle): void;
