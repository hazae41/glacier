import { AsyncStorage } from "../../types/storage";
export declare function useIDBStorage(name: string): IDBStorage;
export declare class IDBStorage implements AsyncStorage {
    readonly name: string;
    readonly async = true;
    readonly initialization: Promise<void>;
    _database?: IDBDatabase;
    constructor(name: string);
    get database(): IDBDatabase | undefined;
    private initialize;
    transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode): Promise<T | undefined>;
    get<T = any>(key: string): Promise<T | undefined>;
    set<T = any>(key: string, value: T): Promise<void | undefined>;
    delete(key: string): Promise<void | undefined>;
}
