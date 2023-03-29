import { AsyncStorage, AsyncStorageParams } from "mods/storages/storage.js"
import { State } from "mods/types/state.js"
import { useEffect, useRef } from "react"

export function useIDBStorage(name?: string) {
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

  readonly #init: Promise<IDBDatabase>

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  constructor(
    readonly name = "xswr"
  ) {
    this.#init = this.#load()

    this.#onunload = () => this.#unload()
    addEventListener("beforeunload", this.#onunload)
  }

  static create(name?: string) {
    if (typeof window === "undefined")
      return
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
      const keys = JSON.parse(item) as [string, number][]

      this.#keys = new Map(keys)

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
    const item = JSON.stringify([...this.#keys])
    localStorage.setItem(`idb.${this.name}.keys`, item)
  }

  async collect() {
    for (const [key, expiration] of this.#keys) {
      if (expiration > Date.now())
        continue
      this.#delete(key)
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

  async get<D>(cacheKey: string, params: AsyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? await keySerializer.stringify(cacheKey)
      : cacheKey

    const value = await this.#transact(async (store) => {
      return await new Promise<unknown>((ok, err) => {
        const req = store.get(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok(req.result)
      })
    }, "readonly")

    if (value === undefined)
      return

    const state = valueSerializer
      ? await valueSerializer.parse(value as string)
      : value as State<D>

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  async set<D>(cacheKey: string, state: State<D>, params: AsyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? await keySerializer.stringify(cacheKey)
      : cacheKey

    const value = valueSerializer
      ? await valueSerializer.stringify(state)
      : state

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.put(value, key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }

  async delete<D>(cacheKey: string, params: AsyncStorageParams<D> = {}) {
    const { keySerializer } = params

    const key = keySerializer
      ? await keySerializer.stringify(cacheKey)
      : cacheKey

    this.#delete(key)
  }

  async #delete(key: string) {
    this.#keys.delete(key)

    return await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.delete(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }
}