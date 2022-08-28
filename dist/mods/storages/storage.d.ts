export interface State<D = any, E = any> {
    data?: D;
    error?: E;
    time?: number;
    aborter?: AbortController;
    cooldown?: number;
    expiration?: number;
}
export interface Serializer<T = any> {
    stringify<T>(value: T): string;
    parse(text: string): T;
}
export declare type Storage<T = any> = SyncStorage<T> | AsyncStorage<T>;
export declare function isAsyncStorage<T = any>(storage: Storage<T>): storage is AsyncStorage<T>;
export interface SyncStorage<T = any> {
    async?: false;
    has(key: string): boolean;
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): void;
}
export interface AsyncStorage<T = any> {
    async: true;
    has(key: string): Promise<boolean>;
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
}
