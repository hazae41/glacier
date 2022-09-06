import { Core } from "../core";
import { Fetcher } from "../index";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { State } from "../types/state";
import { Object } from "../types/schema";
export declare function getScrollStorageKey<D = any, E = any, N = D, K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of ScrollHandle
 */
export declare class ScrollObject<D = any, E = any, N = D, K = any> implements Object<D[], E, N[], K> {
    readonly core: Core;
    readonly scroller: Scroller<D, E, N, K>;
    readonly fetcher: Fetcher<D, E, N, K>;
    readonly params: Params<D[], E, N[], K>;
    readonly pparams: Params<D[], E, N[], K>;
    readonly initialize: boolean;
    readonly key: K | undefined;
    readonly skey: string | undefined;
    readonly mparams: Params<D[], E, N[], K>;
    private _state?;
    constructor(core: Core, scroller: Scroller<D, E, N, K>, fetcher: Fetcher<D, E, N, K>, params?: Params<D[], E, N[], K>, pparams?: Params<D[], E, N[], K>, initialize?: boolean);
    get state(): State<D[], E, N[], K> | null | undefined;
    private loadSync;
    private loadAsync;
    private subscribe;
    mutate(state?: State<D[], E, D[], K>): Promise<State<D[], E, N[], K> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D[], E, N[], K> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D[], E, N[], K> | undefined>;
    scroll(aborter?: AbortController): Promise<State<D[], E, N[], K> | undefined>;
    clear(): Promise<void>;
}
