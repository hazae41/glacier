export interface State<D = any, E = any> {
    data?: D;
    error?: E;
    time?: number;
    aborter?: AbortController;
    expiration?: number;
}
export interface Storage<T> {
    has(key: string): boolean;
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): void;
}
