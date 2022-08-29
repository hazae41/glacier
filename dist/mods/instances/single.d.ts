import { Core } from "../core";
import { Params } from "../types/params";
import { Poster } from "../types/poster";
import { State } from "../types/state";
import { Updater } from "../types/updater";
/**
 * Non-React version of SingleHandle
 */
export declare class SingleInstance<D = any, E = any, K = any> {
    readonly core: Core;
    readonly key: K | undefined;
    readonly poster: Poster<D, K>;
    readonly params: Params<D, E, K>;
    readonly skey: string | undefined;
    private _ready;
    private _state;
    constructor(core: Core, key: K | undefined, poster: Poster<D, K>, params?: Params<D, E, K>);
    get state(): State<D, E>;
    get ready(): boolean;
    mutate(state?: State<D, E>): Promise<State<D, E>>;
    fetch(aborter?: AbortController): Promise<State<D, E>>;
    refetch(aborter?: AbortController): Promise<State<D, E>>;
    update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E>>;
    clear(): Promise<void>;
}
