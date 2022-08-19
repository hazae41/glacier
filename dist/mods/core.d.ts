import { jsoneq } from "../libs/jsoneq";
import { Ortho } from "./ortho";
import { Scroller } from "./scroll";
import { State, Storage } from "./storage";
export declare type Fetcher<D = any> = (url: string) => Promise<D>;
export declare type Listener<D = any, E = any> = (state?: State<D, E>) => void;
export declare const CoreContext: any;
/**
 * Create a core object
 * @param storage Memoized state storage
 * @param equals Memoized equals function
 * @returns
 */
export declare function useCoreMemo(storage?: Storage<State>, equals?: typeof jsoneq): any;
export declare class Core extends Ortho<string, State | undefined> {
    readonly storage: Storage<State>;
    readonly equals: typeof jsoneq;
    constructor(storage?: Storage<State>, equals?: typeof jsoneq);
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
    private cooldown;
    /**
     * Simple fetch
     * @param key
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    fetch<D = any, E = any>(key: string | undefined, fetcher: Fetcher<D>, cooldown?: number): Promise<State<D, E> | undefined>;
    /**
     *
     * @param key Key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    first<D = any, E = any>(key: string | undefined, scroller: Scroller<D>, fetcher: Fetcher<D>, cooldown?: number): Promise<State<D[], E>>;
    /**
     *
     * @param key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    scroll<D = any, E = any>(key: string | undefined, scroller: Scroller<D>, fetcher: Fetcher<D>, cooldown?: number): Promise<State<D[], E>>;
}
