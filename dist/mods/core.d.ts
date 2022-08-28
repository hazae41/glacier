/// <reference types="node" />
import { Ortho } from "../libs/ortho.js";
import { Equals } from "./equals.js";
import { Scroll } from "./scroll.js";
import { Single } from "./single.js";
import { Serializer, State, Storage } from "./storages/storage.js";
import { TimeParams } from "./time.js";
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
export interface CoreParams extends TimeParams {
    storage?: Storage<State>;
    equals?: Equals;
}
export declare class Core extends Ortho<string, State | undefined> {
    readonly single: Single;
    readonly scroll: Scroll;
    readonly cache: Map<string, State<any, any>>;
    readonly storage?: Storage<State>;
    readonly equals: Equals;
    readonly serializer: Serializer;
    readonly cooldown: number;
    readonly expiration: number;
    readonly timeout: number;
    protected mounted: boolean;
    constructor(params?: CoreParams);
    get async(): boolean;
    hasSync(key: string | undefined): boolean;
    has(key: string | undefined): Promise<boolean>;
    getSync<D = any, E = any>(key: string | undefined): State<D, E> | undefined;
    get<D = any, E = any>(key: string | undefined): Promise<State<D, E> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any>(key: string | undefined, state: State<D, E>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    delete(key: string | undefined): Promise<void>;
    apply<D = any, E = any>(key: string | undefined, current?: State<D, E>, state?: State<D, E>): Promise<State<D, E> | undefined>;
    mutate<D = any, E = any>(key: string | undefined, state?: State<D, E>): Promise<State<D, E> | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any>(current?: State<D, E>, force?: boolean): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    subscribe(key: string | undefined, listener: (x: State) => void): void;
    unsubscribe(key: string | undefined, listener: (x: State) => void): Promise<void>;
    unmount(): void;
}
