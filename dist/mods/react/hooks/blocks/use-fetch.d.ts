import { Handle } from "../bases";
/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
export declare function useFetch(handle: Handle): void;
