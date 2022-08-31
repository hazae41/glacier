import { AsyncStorage } from "mods/types/storage"
import { useRef } from "react"

export function useIDBStorage(name: string) {
  const ref = useRef<IDBStorage>()
  if (!ref.current)
    ref.current = new IDBStorage(name)
  return ref.current
}

export class IDBStorage implements AsyncStorage {
  readonly async = true
  readonly initialization: Promise<void>

  _database: IDBDatabase

  constructor(readonly name: string) {
    this.initialization = this.initialize()
  }

  get database() { return this._database }

  private async initialize() {
    this._database = await new Promise<IDBDatabase>((ok, err) => {
      const req = indexedDB.open(this.name, 1)

      req.onupgradeneeded = () =>
        req.result.createObjectStore("keyval", {})
      req.onblocked = () => err("blocked")
      req.onsuccess = () => ok(req.result)
      req.onerror = () => err(req.error)
    })
  }

  async transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode) {
    if (!this.database) await this.initialization

    return await new Promise<T>((ok, err) => {
      const tx = this.database.transaction("keyval", mode)
      tx.onerror = () => err(tx.error)
      tx.oncomplete = () => ok(result)

      let result: T;

      callback(tx.objectStore("keyval"))
        .then(x => result = x)
        .then(() => tx.commit())
        .catch(err)
    })
  }

  async get<T = any>(key: string) {
    return await this.transact(async (store) => {
      return await new Promise<T>((ok, err) => {
        const req = store.get(key)
        req.onerror = () => err(req.error)
        req.onsuccess = () => ok(req.result)
      })
    }, "readonly")
  }

  async set<T = any>(key: string, value: T) {
    return await this.transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.put(value, key)
        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }

  async delete(key: string) {
    return await this.transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.delete(key)
        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }
}