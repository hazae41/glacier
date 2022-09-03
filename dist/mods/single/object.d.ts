import { Core } from "../core";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { State } from "../types/state";
import { Updater } from "../types/updater";
export declare function getSingleStorageKey<K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of SingleHandle
 */
export declare class SingleObject<D = any, E = any, K = any> {
    readonly core: Core;
    readonly key: K | undefined;
    readonly poster: Poster<D, E, K>;
    readonly params: Params<D, E, K>;
    readonly pparams: Params<D, E, K>;
    readonly skey: string | undefined;
    readonly mparams: Params<D, E, K>;
    private _state?;
    constructor(core: Core, key: K | undefined, poster: Poster<D, E, K>, params?: Params<D, E, K>, pparams?: Params<D, E, K>);
    get state(): State<D, E> | null | undefined;
    mutate(state?: State<D, E>): Promise<State<D, E> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D, E> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D, E> | undefined>;
    update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E> | undefined>;
    clear(): Promise<void>;
}
