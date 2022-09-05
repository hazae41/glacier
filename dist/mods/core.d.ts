/// <reference types="node" />
import { Ortho } from "../libs/ortho";
import { ScrollHelper } from "./scroll";
import { SingleHelper } from "./single";
import { Params } from "./types/params";
import { State } from "./types/state";
export declare type Listener<D = any, E = any> = (x?: State<D, E>) => void;
export declare class Core extends Ortho<string, State | undefined> {
    readonly single: SingleHelper;
    readonly scroll: ScrollHelper;
    readonly cache: Map<string, State<any, any>>;
    private _mounted;
    constructor();
    get mounted(): boolean;
    unmount(): void;
    getSync<D = any, E = any>(skey: string | undefined, params?: Params<D, E>): State<D, E> | undefined | null;
    get<D = any, E = any>(skey: string | undefined, params?: Params<D, E>, ignore?: boolean): Promise<State<D, E> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any>(skey: string | undefined, state: State<D, E>, params?: Params<D, E>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    delete<D = any, E = any>(skey: string | undefined, params?: Params<D, E>): Promise<void>;
    apply<D = any, E = any>(skey: string | undefined, current?: State<D, E>, state?: State<D, E>, params?: Params<D, E>, aborter?: AbortController): Promise<State<D, E> | undefined>;
    mutate<D = any, E = any>(key: string | undefined, state?: State<D, E>, params?: Params<D, E>, aborter?: AbortController): Promise<State<D, E> | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any>(current?: State<D, E>, force?: boolean): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    subscribe<D = any, E = any>(key: string | undefined, listener: Listener<D, E>, _?: Params<D, E>): void;
    unsubscribe<D = any, E = any>(key: string | undefined, listener: Listener<D, E>, params?: Params<D, E>): Promise<void>;
}
