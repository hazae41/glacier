import { Handle } from "../handles";
/**
 * Call a function on error
 * @param handle
 * @param callback
 */
export declare function useError<D = any, E = any, N extends D = D, K = any>(handle: Handle<D, E, N, K>, callback: (e: E) => void): void;
