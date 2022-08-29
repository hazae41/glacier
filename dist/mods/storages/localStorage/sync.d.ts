import { Serializer } from "../../types/serializer";
import { State } from "../../types/state";
import { SyncStorage } from "../../types/storage";
/**
 * Synchronous local storage
 *
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 *
 * Will display data on first render
 *
 * @see AsyncLocalStorage
 */
export declare function useSyncLocalStorage(serializer?: Serializer): SyncLocalStorage;
/**
 * Synchronous local storage
 *
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 *
 * Will display data on first render
 *
 * @see AsyncLocalStorage
 */
export declare class SyncLocalStorage implements SyncStorage<State> {
    readonly serializer: Serializer;
    readonly async = false;
    constructor(serializer?: Serializer);
    has(key: string): boolean;
    get(key: string): State;
    set(key: string, state: State): void;
    delete(key: string): Promise<void>;
}
