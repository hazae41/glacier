import { Fetcher } from "../../../index";
import { Params } from "../../../types/params";
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
    update(updater: Updater<D, E, K>, aborter?: AbortController): Promise<State<D, E, K> | undefined>;
}
/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single handle
 */
export declare function useSingle<D = any, E = any, K = any>(key: K | undefined, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D, E, K>): SingleHandle<D, E, K>;
