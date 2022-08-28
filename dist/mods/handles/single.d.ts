import { Poster, Updater } from "../core.js";
import { State } from "../storages/storage.js";
import { TimeParams } from "../time.js";
import { Handle } from "./handle.js";
/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any, K = any> extends Handle<D, E, K> {
    /**
     * Optimistic update
     * @param updater Mutation function
     * @param aborter Custom AbortController
     */
    update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E> | undefined>;
}
/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param poster Resource poster or fetcher (memoized)
 * @param tparams Time parameters (constant)
 * @returns Single handle
 */
export declare function useSingle<D = any, E = any, K = any>(key: K | undefined, poster: Poster<D, K>, tparams?: TimeParams): SingleHandle<D, E, K>;
