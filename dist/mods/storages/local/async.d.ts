import { AsyncStorage, State } from "../storage";
export declare function useAsyncLocalStorage(): AsyncLocalStorage;
export declare class AsyncLocalStorage implements AsyncStorage<State> {
    readonly async = true;
    constructor();
    has(key: string): Promise<boolean>;
    get(key: string): Promise<State>;
    set(key: string, state: State): Promise<void>;
    delete(key: string): Promise<void>;
}
