import { Core } from "../core";
import { Fetcher } from "../index";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { State } from "../types/state";
import { Object } from "../types/schema";
export declare function getScrollStorageKey<K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of ScrollHandle
 */
export declare class ScrollObject<D = any, E = any, K = any> implements Object<D[], E, K> {
    readonly core: Core;
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, E, K>;
    readonly params: Params<D[], E, K>;
    readonly pparams: Params<D[], E, K>;
    readonly initialize: boolean;
    readonly key: K | undefined;
    readonly skey: string | undefined;
    readonly mparams: Params<D[], E, K>;
    private _state?;
    constructor(core: Core, scroller: Scroller<D, K>, fetcher: Fetcher<D, E, K>, params?: Params<D[], E, K>, pparams?: Params<D[], E, K>, initialize?: boolean);
    get state(): State<D[], E> | null | undefined;
    private loadSync;
    private loadAsync;
    private subscribe;
    mutate(state?: State<D[], E>): Promise<State<D[], E> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D[], E> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D[], E> | undefined>;
    scroll(aborter?: AbortController): Promise<State<D[], E> | undefined>;
    clear(): Promise<void>;
}
