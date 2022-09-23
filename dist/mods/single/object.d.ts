import { Core } from "../core";
import { Fetcher } from "../index";
import { Mutator } from "../types/mutator";
import { Object } from "../types/object";
import { Params } from "../types/params";
import { State } from "../types/state";
import { Updater, UpdaterParams } from "../types/updater";
export declare function getSingleStorageKey<D = any, E = any, K = any>(key: K, params: Params): string | undefined;
/**
 * Non-React version of SingleHandle
 */
export declare class SingleObject<D = any, E = any, K = any> implements Object<D, E, K> {
    readonly core: Core;
    readonly key: K | undefined;
    readonly fetcher: Fetcher<D, E, K> | undefined;
    readonly params: Params<D, E, K>;
    readonly skey: string | undefined;
    readonly mparams: Params<D, E, K>;
    private _init;
    private _state;
    constructor(core: Core, key: K | undefined, fetcher: Fetcher<D, E, K> | undefined, params?: Params<D, E, K>);
    get init(): Promise<void> | undefined;
    get state(): State<D, E, K> | null | undefined;
    get ready(): boolean;
    private loadSync;
    private loadAsync;
    private subscribe;
    mutate(mutator: Mutator<D, E, K>): Promise<State<D, E, K> | undefined>;
    fetch(aborter?: AbortController): Promise<State<D, E, K> | undefined>;
    refetch(aborter?: AbortController): Promise<State<D, E, K> | undefined>;
    update(updater: Updater<D, E, K>, uparams?: UpdaterParams<D, E, K>, aborter?: AbortController): Promise<State<D, E, K> | undefined>;
    clear(): Promise<void>;
}
