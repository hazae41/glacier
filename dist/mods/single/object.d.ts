import { Core } from "../core";
import { Mutator } from "../types/mutator";
import { Object } from "../types/object";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { State } from "../types/state";
import { Updater } from "../types/updater";
export declare function getSingleStorageKey<D = any, E = any, N = D, K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of SingleHandle
 */
export declare class SingleObject<D = any, E = any, N = D, K = any> implements Object<D, E, N, K> {
    readonly core: Core;
    readonly key: K | undefined;
    readonly poster: Poster<D, E, N, K>;
    readonly skey: string | undefined;
    readonly mparams: Params<D, E, N, K>;
    readonly init: Promise<void>;
    private _state?;
    constructor(core: Core, key: K | undefined, poster: Poster<D, E, N, K>, params?: Params<D, E, N, K>, pparams?: Params<D, E, N, K>);
    get state(): State<D, E, N, K> | null | undefined;
    get ready(): boolean;
    private loadSync;
    private loadAsync;
    private subscribe;
    mutate(mutator: Mutator<D, E, N, K>): Promise<State<D, E, N, K> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
    update(updater: Updater<D, E, N, K>, aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
    clear(): Promise<void>;
}
