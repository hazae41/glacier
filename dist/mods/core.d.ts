/// <reference types="node" />
import { Ortho } from "libs/ortho.js";
import { Scroll } from "mods/scroll";
import { Single } from "mods/single";
import { Params } from "mods/types/params";
import { State } from "mods/types/state";
export interface Result<D = any> {
    data: D;
    cooldown?: number;
    expiration?: number;
}
export declare type Fetcher<D = any, K = any> = (key: K, more: FetcherMore) => Promise<Result<D>>;
export declare type FetcherMore<D = any> = {
    signal: AbortSignal;
};
export declare type Poster<D = any, K = any> = (key: K, more: PosterMore) => Promise<Result<D>>;
export declare type PosterMore<D = any> = {
    signal: AbortSignal;
    data: D;
};
export declare type Scroller<D = any, K = any> = (previous?: D) => K | undefined;
export declare type Updater<D = any> = (previous?: D) => D;
export declare class Core extends Ortho<string, State | undefined> {
    readonly single: Single;
    readonly scroll: Scroll;
    readonly cache: Map<string, State<any, any>>;
    private _mounted;
    constructor();
    get mounted(): boolean;
    unmount(): void;
    hasSync<D = any, E = any>(key: string | undefined, params?: Params<D, E>): boolean;
    has<D = any, E = any>(key: string | undefined, params?: Params<D, E>): Promise<boolean>;
    getSync<D = any, E = any>(key: string | undefined, params?: Params<D, E>): State<D, E> | undefined;
    get<D = any, E = any>(key: string | undefined, params?: Params<D, E>): Promise<State<D, E> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any>(key: string | undefined, state: State<D, E>, params?: Params<D, E>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    delete<D = any, E = any>(key: string | undefined, params?: Params<D, E>): Promise<void>;
    apply<D = any, E = any>(key: string | undefined, current?: State<D, E>, state?: State<D, E>, params?: Params<D, E>): Promise<State<D, E> | undefined>;
    mutate<D = any, E = any>(key: string | undefined, state?: State<D, E>, params?: Params<D, E>): Promise<State<D, E> | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any>(current?: State<D, E>, force?: boolean): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    subscribe<D = any, E = any>(key: string | undefined, listener: (x: State<D, E>) => void, _?: Params<D, E>): void;
    unsubscribe<D = any, E = any>(key: string | undefined, listener: (x: State<D, E>) => void, params?: Params<D, E>): Promise<void>;
}
