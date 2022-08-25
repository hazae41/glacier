import { Ortho } from "../libs/ortho";
import { Equals } from "./equals";
import { Scroll } from "./scroll";
import { Single } from "./single";
import { State, Storage } from "./storage";
export declare const DEFAULT_COOLDOWN = 1000;
export declare type Fetcher<D = any> = (url: string, more: FetcherMore) => Promise<D>;
export declare type FetcherMore<D = any> = {
    signal: AbortSignal;
};
export declare type Poster<D = any> = (url: string, more: PosterMore) => Promise<D>;
export declare type PosterMore<D = any> = {
    signal: AbortSignal;
    data: D;
};
export declare type Scroller<D = any> = (previous?: D) => string | undefined;
export declare type Updater<D = any> = (previous?: D) => D;
export declare type Listener<D = any, E = any> = (state?: State<D, E>) => void;
export declare function isAbortError(e: unknown): boolean;
export declare class Core extends Ortho<string, State | undefined> {
    readonly storage: Storage<State>;
    readonly equals: Equals;
    readonly single: Single;
    readonly scroll: Scroll;
    constructor(storage?: Storage<State>, equals?: Equals);
    /**
     * Check if key exists from storage
     * @param key Key
     * @returns boolean
     */
    has(key: string | undefined): boolean;
    /**
     * Grab current state from storage
     * @param key Key
     * @returns Current state
     */
    get<D = any, E = any>(key: string | undefined): State<D, E> | undefined;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any>(key: string | undefined, state: State<D, E>): void;
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    delete(key: string | undefined): void;
    /**
     * Merge a new state with the old state
     * - Will check if the new time is after the old time
     * - Will check if it changed using this.equals
     * @param key
     * @param state
     * @returns
     */
    mutate<D = any, E = any>(key: string | undefined, state: State<D, E>): State<D, E> | undefined;
    /**
     * True if we should cooldown this resource
     */
    cooldown<D = any, E = any>(current?: State<D, E>, cooldown?: number): boolean;
}
