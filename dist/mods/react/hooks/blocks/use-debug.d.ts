import { Handle } from "../handles";
/**
 * Show handle in console when it changes
 * @param handle
 */
export declare function useDebug<D = any, E = any, N extends D = D, K = any>(handle: Handle<D, E, N, K>, label: string): void;
