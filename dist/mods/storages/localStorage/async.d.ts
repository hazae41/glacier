import { Serializer } from "mods/types/serializer";
import { State } from "mods/types/state";
import { AsyncStorage } from "mods/types/storage";
/**
 * Asynchronous local storage
 *
 * Use for compatibility with SSR
 * Use for storing large objects
 *
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 *
 * @see SyncLocalStorage
 * @see useFallback
 */
export declare function useAsyncLocalStorage(serializer?: Serializer): AsyncLocalStorage;
/**
 * Asynchronous local storage
 *
 * Use for compatibility with SSR
 * Use for storing large objects
 *
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 *
 * @see SyncLocalStorage
 * @see useFallback
 */
export declare class AsyncLocalStorage implements AsyncStorage<State> {
    readonly serializer: Serializer;
    readonly async = true;
    constructor(serializer?: Serializer);
    has(key: string): Promise<boolean>;
    get(key: string): Promise<State>;
    set(key: string, state: State): Promise<void>;
    delete(key: string): Promise<void>;
}
