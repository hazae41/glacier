import { Handle } from "../handles";
/**
 * Call a function on error
 * @param handle
 * @param callback
 */
export declare function useError<D = any, E = any>(handle: Handle<D, E>, callback: (e: E) => void): void;
