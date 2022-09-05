import { AsyncStorage } from "../../types/storage";
export declare function useIDBStorage(name: string): IDBStorage;
export declare class IDBStorage implements AsyncStorage {
    readonly name: string;
    readonly async = true;
    readonly initialization?: Promise<void>;
    readonly keys: Set<string>;
    readonly onunload?: () => void;
    _database?: IDBDatabase;
    constructor(name: string);
    get database(): IDBDatabase | undefined;
    private load;
    unmount(): void;
    private unload;
    collect(): Promise<void>;
    transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode): Promise<T | undefined>;
    get<T = any>(key: string, ignore?: boolean): Promise<T | undefined>;
    set<T = any>(key: string, value: T, ignore?: boolean): Promise<void>;
    delete(key: string, ignore?: boolean): Promise<void>;
}
