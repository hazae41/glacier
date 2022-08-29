import { Core } from "../core";
import { Fetcher } from "../index";
import { Params } from "../types/params";
import { Scroller } from "../types/scroller";
import { State } from "../types/state";
/**
 * Non-React version of ScrollHandle
 */
export declare class ScrollInstance<D = any, E = any, K = any> {
    readonly core: Core;
    readonly scroller: Scroller<D, K>;
    readonly fetcher: Fetcher<D, K>;
    readonly params: Params<D[], E, K>;
    readonly pparams: Params<D[], E, K>;
    readonly key: K | undefined;
    readonly skey: string | undefined;
    readonly mparams: Params<D[], E, K>;
    private _ready;
    private _state;
    constructor(core: Core, scroller: Scroller<D, K>, fetcher: Fetcher<D, K>, params?: Params<D[], E, K>, pparams?: Params<D[], E, K>);
    get state(): State<D[], E>;
    get ready(): boolean;
    mutate(state?: State<D[], E>): Promise<State<D[], E>>;
    fetch(aborter?: AbortController): Promise<State<D[], E>>;
    refetch(aborter?: AbortController): Promise<State<D[], E>>;
    scroll(aborter?: AbortController): Promise<State<D[], E>>;
    clear(): Promise<void>;
}
