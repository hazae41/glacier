import { State } from "../../types/state";
import { AsyncStorage } from "../../types/storage";
export declare function useIDBStorage(name: string): IDBStorage;
export declare class IDBStorage implements AsyncStorage<State> {
    readonly name: string;
    readonly async = true;
    readonly initialization: Promise<void>;
    _database: IDBDatabase;
    constructor(name: string);
    get database(): IDBDatabase;
    private initialize;
    transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode): Promise<T>;
    get(key: string): Promise<State<any, any>>;
    set(key: string, state: State): Promise<void>;
    delete(key: string): Promise<void>;
}
