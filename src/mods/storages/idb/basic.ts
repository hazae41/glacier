import { AsyncStorage } from "mods/storages/storage.js"
import { State } from "mods/types/state.js"
import { useEffect, useRef } from "react"

export function useIDBStorage(name: string) {
  const storage = useRef<IDBStorage>()

  if (storage.current === undefined)
    storage.current = IDBStorage.create(name)

  useEffect(() => () => {
    storage.current?.unmount().catch(console.error)
  }, [])

  return storage.current
}

export class IDBStorage implements AsyncStorage {

  readonly async = true as const

  readonly keys = new Set<string>()

  readonly #init: Promise<IDBDatabase>

  readonly #onunload: () => void

  constructor(readonly name: string) {
    this.#init = this.#load()

    this.#onunload = () => this.#unload()
    addEventListener("beforeunload", this.#onunload)
  }

  static create(name: string) {
    if (typeof indexedDB === "undefined")
      return

    return new this(name)
  }

  /**
   * Load the database and the garbage collector keys
   * @returns 
   */
  async #load() {
    const database = await new Promise<IDBDatabase>((ok, err) => {
      const req = indexedDB.open(this.name, 1)

      req.onupgradeneeded = () =>
        req.result.createObjectStore("keyval", {})

      req.onblocked = () => err("blocked")
      req.onsuccess = () => ok(req.result)
      req.onerror = () => err(req.error)
    })

    const item = localStorage.getItem(`idb.${this.name}.keys`)

    if (item !== null) {
      const keys = JSON.parse(item) as string[]
      keys.forEach(key => this.keys.add(key))

      localStorage.removeItem(`idb.${this.name}.keys`)

      await this.collect().catch(console.error)
    }

    return database
  }

  async unmount() {
    removeEventListener("beforeunload", this.#onunload)

    await this.collect()
  }

  /**
   * Save the garbage collector keys
   */
  #unload() {
    const item = JSON.stringify([...this.keys])
    localStorage.setItem(`idb.${this.name}.keys`, item)
  }

  async collect() {
    for (const key of this.keys) {
      const state = await this.get<State>(key, true)

      if (state?.expiration === undefined)
        continue
      if (state.expiration > Date.now())
        continue

      this.delete(key)
    }
  }

  async #transact<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode) {
    const database = await this.#init

    return await new Promise<T>((ok, err) => {
      const tx = database.transaction("keyval", mode)
      tx.onerror = () => err(tx.error)
      tx.oncomplete = () => ok(result)

      let result: T;

      callback(tx.objectStore("keyval"))
        .then(x => result = x)
        .then(() => tx.commit())
        .catch(err)
    })
  }

  async get<D>(key: string, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    return await this.#transact(async (store) => {
      return await new Promise<State<D>>((ok, err) => {
        const req = store.get(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok(req.result)
      })
    }, "readonly")
  }

  async set<D>(key: string, value: State<D>, shallow = false) {
    if (!shallow)
      this.keys.add(key)

    return await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.put(value, key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }

  async delete(key: string, shallow = false) {
    if (!shallow)
      this.keys.delete(key)

    return await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.delete(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }
}