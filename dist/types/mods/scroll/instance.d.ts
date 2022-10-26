import { Core } from '../core.js';
import { Fetcher } from '../types/fetcher.js';
import { Instance } from '../types/instance.js';
import { Mutator } from '../types/mutator.js';
import { Params } from '../types/params.js';
import { Scroller } from '../types/scroller.js';
import { State } from '../types/state.js';

declare function getScrollStorageKey<D = any, E = any, K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of ScrollHandle
 */
declare class ScrollInstance<D = any, E = any, K = any> implements Instance<D[], E, K> {
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

export { ScrollInstance, getScrollStorageKey };
