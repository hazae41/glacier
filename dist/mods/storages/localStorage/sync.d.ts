import { Serializer } from "../../types/serializer";
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
export declare class SyncLocalStorage implements SyncStorage {
    readonly serializer: Serializer;
    readonly async = false;
    constructor(serializer?: Serializer);
    get<T = any>(key: string): T;
    set<T = any>(key: string, value: T): void;
    delete(key: string): Promise<void>;
}
