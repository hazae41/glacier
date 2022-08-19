import { Fetcher } from "./core";
import { Handle } from "./hooks";
/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any> extends Handle<D, E> {
}
/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
export declare function useSingle<D = any, E = any>(key: string | undefined, fetcher: Fetcher<D>, cooldown?: number): SingleHandle<D, E>;
