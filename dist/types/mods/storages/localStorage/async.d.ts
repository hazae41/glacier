import { Serializer } from "../../types/serializer.js";
import { AsyncStorage } from "../../types/storage.js";
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
export declare function useAsyncLocalStorage(prefix?: string, serializer?: Serializer): AsyncLocalStorage;
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
    readonly prefix: string;
    readonly serializer: Serializer;
    readonly async = true;
    readonly keys: Set<string>;
    readonly onunload?: () => void;
    constructor(prefix?: string, serializer?: Serializer);
    unmount(): void;
    collect(): void;
    getSync<T = any>(key: string, ignore?: boolean): T | undefined;
    get<T = any>(key: string, ignore?: boolean): Promise<T | undefined>;
    set<T = any>(key: string, value: T, ignore?: boolean): Promise<void>;
    delete(key: string, ignore?: boolean): Promise<void>;
}
