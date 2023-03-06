import { AsyncStorage } from "mods/storages/storage.js"
import { State } from "mods/types/state.js"
import { useEffect, useRef } from "react"

export function useIDBStorage(name: string) {
  const storage = useRef<IDBStorage>()

  if (storage.current === undefined)
    storage.current = new IDBStorage(name)

  useEffect(() => () => {
    storage.current?.unmount()
  }, [])

  return storage.current
}

export class IDBStorage implements AsyncStorage {

  readonly async = true

  readonly initialization?: Promise<void>

  readonly keys = new Set<string>()

  readonly onunload?: () => void

  _database?: IDBDatabase

  constructor(readonly name: string) {
    if (typeof indexedDB === "undefined")
      return

    this.initialization = this.#load()

    this.onunload = () => this.#unload()
    addEventListener("beforeunload", this.onunload)
  }

  get database() { return this._database }

  async #load() {
    if (typeof indexedDB === "undefined")
      return

    this._database = await new Promise<IDBDatabase>((ok, err) => {
      const req = indexedDB.open(this.name, 1)

      req.onupgradeneeded = () =>
        req.result.createObjectStore("keyval", {})

      req.onblocked = () => err("blocked")
      req.onsuccess = () => ok(req.result)
      req.onerror = () => err(req.error)
    })

    if (typeof Storage === "undefined")
      return

    const item = localStorage.getItem(`idb.${this.name}.keys`)

    if (item === null)
      return

    const keys = JSON.parse(item) as string[]
    keys.forEach(key => this.keys.add(key))

    localStorage.removeItem(`idb.${this.name}.keys`)

    await this.collect().catch(console.error)
  }

  unmount() {
    if (typeof indexedDB === "undefined")
      return

    if (this.onunload !== undefined)
      removeEventListener("beforeunload", this.onunload)

    this.collect().catch(console.error)
  }

  #unload() {
    if (typeof Storage === "undefined")
      return

    const item = JSON.stringify([...this.keys])
    localStorage.setItem(`idb.${this.name}.keys`, item)
  }

  async collect() {
    if (typeof indexedDB === "undefined")
      return

    for (const key of this.keys) {
      const state = await this.get<State>(key, true)
      if (state?.expiration === undefined) continue
      if (state.expiration > Date.now()) continue

      this.delete(key, false)
    }
  }

  async transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode) {
    if (typeof indexedDB === "undefined")
      return

    if (this.database === undefined)
      await this.initialization

    return await new Promise<T>((ok, err) => {
      if (this.database === undefined)
        throw new Error("Undefined database")

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

  async get<T>(key: string, ignore = false) {
    if (typeof indexedDB === "undefined")
      return

    if (!ignore && !this.keys.has(key))
      this.keys.add(key)

    return await this.transact(async (store) => {
      return await new Promise<T>((ok, err) => {
        const req = store.get(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok(req.result)
      })
    }, "readonly")
  }

  async set<T>(key: string, value: T, ignore = false) {
    if (typeof indexedDB === "undefined")
      return

    if (!ignore && !this.keys.has(key))
      this.keys.add(key)

    return await this.transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.put(value, key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }

  async delete(key: string, ignore = false) {
    if (typeof indexedDB === "undefined")
      return

    if (!ignore && this.keys.has(key))
      this.keys.delete(key)

    return await this.transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.delete(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }
}