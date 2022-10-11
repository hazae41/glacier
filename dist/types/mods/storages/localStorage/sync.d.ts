import { Serializer } from '../../types/serializer.js';
import { SyncStorage } from '../../types/storage.js';

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
declare function useSyncLocalStorage(prefix?: string, serializer?: Serializer): SyncLocalStorage;
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
declare class SyncLocalStorage implements SyncStorage {
    readonly prefix: string;
    readonly serializer: Serializer;
    readonly async = false;
    readonly keys: Set<string>;
    readonly onunload?: () => void;
    constructor(prefix?: string, serializer?: Serializer);
    unmount(): void;
    collect(): void;
    get<T = any>(key: string, ignore?: boolean): T | undefined;
    set<T = any>(key: string, value: T, ignore?: boolean): void;
    delete(key: string, ignore?: boolean): void;
}

export { SyncLocalStorage, useSyncLocalStorage };
