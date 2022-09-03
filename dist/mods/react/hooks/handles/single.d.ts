import { Params } from "../../../types/params";
import { Poster } from "../../../types/poster";
import { State } from "../../../types/state";
import { Updater } from "../../../types/updater";
import { Handle } from "./handle";
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
 * @param params Parameters (static)
 * @returns Single handle
 */
export declare function useSingle<D = any, E = any, K = any>(key: K | undefined, poster: Poster<D, E, K>, params?: Params<D, E>): SingleHandle<D, E, K>;
