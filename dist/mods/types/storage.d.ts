export declare type Storage = SyncStorage | AsyncStorage;
export interface SyncStorage {
    async?: false;
    unmount(): void;
    collect(): void;
    get<T = any>(key: string, ignore?: boolean): T | undefined;
    set<T = any>(key: string, value: T, ignore?: boolean): void;
    delete(key: string, ignore?: boolean): void;
}
export interface AsyncStorage {
    async: true;
    unmount(): void;
    collect(): void;
    get<T = any>(key: string, ignore?: boolean): Promise<T | undefined>;
    set<T = any>(key: string, value: T, ignore?: boolean): Promise<void>;
    delete(key: string, ignore?: boolean): Promise<void>;
}
export declare function isAsyncStorage(storage: Storage): storage is AsyncStorage;
