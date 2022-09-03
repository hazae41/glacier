import { Serializer } from "../../types/serializer";
import { AsyncStorage } from "../../types/storage";
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
export declare class AsyncLocalStorage implements AsyncStorage {
    readonly serializer: Serializer;
    readonly async = true;
    constructor(serializer?: Serializer);
    get<T = any>(key: string): Promise<T | undefined>;
    set<T = any>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
}
