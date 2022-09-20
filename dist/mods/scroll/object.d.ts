import { Core } from "../core";
import { Fetcher } from "../index";
import { Mutator } from "../types/mutator";
import { Object } from "../types/object";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { State } from "../types/state";
export declare function getScrollStorageKey<D = any, E = any, K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of ScrollHandle
 */
export declare class ScrollObject<D = any, E = any, K = any> implements Object<D[], E, K> {
    readonly core: Core;
    readonly scroller: Scroller<D, E, K>;
    readonly fetcher: Fetcher<D, E, K> | undefined;
    readonly params: Params<D[], E, K>;
    readonly key: K | undefined;
    readonly skey: string | undefined;
    readonly mparams: Params<D[], E, K>;
    private _init;
    private _state;
    constructor(core: Core, scroller: Scroller<D, E, K>, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D[], E, K>);
    get init(): Promise<void> | undefined;
    get state(): State<D[], E, K> | null | undefined;
    get ready(): boolean;
    private loadSync;
    private loadAsync;
    private subscribe;
    mutate(mutator: Mutator<D[], E, K>): Promise<State<D[], E, K> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D[], E, K> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D[], E, K> | undefined>;
    scroll(aborter?: AbortController): Promise<State<D[], E, K> | undefined>;
    clear(): Promise<void>;
}
