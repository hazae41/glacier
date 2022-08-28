import { State, SyncStorage } from "../storage";
export declare function useSyncLocalStorage(): SyncLocalStorage;
export declare class SyncLocalStorage implements SyncStorage<State> {
    readonly async = false;
    constructor();
    has(key: string): boolean;
    get(key: string): State;
    set(key: string, state: State): void;
    delete(key: string): Promise<void>;
}
