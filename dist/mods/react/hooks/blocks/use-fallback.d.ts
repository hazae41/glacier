import { Handle } from "../handles";
import { State } from "../../../types/state";
/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param handle
 * @param state
 */
export declare function useFallback<D = any, E = any, N extends D = D, K = any>(handle: Handle<D, E, N, K>, state?: State<D, E, N, K>): void;
