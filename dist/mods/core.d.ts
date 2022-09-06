/// <reference types="node" />
import { Ortho } from "../libs/ortho";
import { ScrollHelper } from "./scroll";
import { SingleHelper } from "./single";
import { Params } from "./types/params";
import { State } from "./types/state";
export declare type Listener<D = any, E = any, N = D, K = any> = (x?: State<D, E, N, K>) => void;
export declare class Core extends Ortho<string, State | undefined> {
    readonly single: SingleHelper;
    readonly scroll: ScrollHelper;
    readonly cache: Map<string, State<any, any, any, any>>;
    private _mounted;
    constructor();
    get mounted(): boolean;
    unmount(): void;
    getSync<D = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): State<D, E, N, K> | undefined | null;
    get<D = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>, ignore?: boolean): Promise<State<D, E, N, K> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any, N = D, K = any>(skey: string | undefined, state: State<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    delete<D = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): Promise<void>;
    apply<D = any, E = any, N = D, K = any>(skey: string | undefined, current?: State<D, E, N, K>, state?: State<D, E, D, K>, params?: Params<D, E, N, K>, aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
    normalize<D = any, E = any, N = D, K = any>(normalized: D): Promise<N>;
    mutate<D = any, E = any, N = D, K = any>(key: string | undefined, state?: State<D, E, D, K>, params?: Params<D, E, N, K>, aborter?: AbortController): Promise<State<D, E, N, K> | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any, N = D, K = any>(current?: State<D, E, N, K>, force?: boolean): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    subscribe<D = any, E = any, N = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): void;
    unsubscribe<D = any, E = any, N = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
}
