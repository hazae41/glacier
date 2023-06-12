import { Err, Ok, Result } from "@hazae41/result"
import { AsyncStorage, AsyncStorageParams } from "mods/storages/storage.js"
import { StoredState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { StorageCreationError } from "../errors.js"

export function useIDBStorage(name?: string) {
  const storage = useRef<Result<IDBStorage, StorageCreationError>>()

  if (storage.current === undefined)
    storage.current = IDBStorage.tryCreate(name).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner.unmount().catch(console.error)
  }, [])

  return storage.current
}

export class IDBStorage implements AsyncStorage {

  readonly async = true as const

  readonly #init: Promise<IDBDatabase>

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  private constructor(
    readonly name = "xswr"
  ) {
    this.#init = this.#load()

    this.#onunload = () => this.#unload()
    addEventListener("beforeunload", this.#onunload)
  }

  static tryCreate(name?: string): Result<IDBStorage, StorageCreationError> {
    if (typeof indexedDB === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new IDBStorage(name))
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

    const keys = await this.#get<[string, number][]>("__keys")

    if (keys !== undefined) {
      this.#keys = new Map(keys)
      this.#delete("__keys")

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
    this.#set("__keys", [...this.#keys])
  }

  async collect() {
    for (const [key, expiration] of this.#keys) {
      if (expiration > Date.now())
        continue
      this.#keys.delete(key)
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

  async #get<T>(key: string) {
    return await this.#transact(async (store) => {
      return await new Promise<T | undefined>((ok, err) => {
        const req = store.get(key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok(req.result)
      })
    }, "readonly")
  }

  async get<D>(cacheKey: string, params: AsyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? await keySerializer.stringify(cacheKey)
      : cacheKey

    const value = await this.#get(key)

    if (value === undefined)
      return undefined

    const state = valueSerializer
      ? await valueSerializer.parse(value as string)
      : value as StoredState<D>

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  async #set<T>(key: string, value: T) {
    await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.put(value, key)

        req.onerror = () => err(req.error)
        req.onsuccess = () => ok()
      })
    }, "readwrite")
  }

  async set<D>(cacheKey: string, state: StoredState<D>, params: AsyncStorageParams<D> = {}) {
    const { keySerializer, valueSerializer } = params

    const key = keySerializer
      ? await keySerializer.stringify(cacheKey)
      : cacheKey

    const value = valueSerializer
      ? await valueSerializer.stringify(state)
      : state

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return await this.#set(key, value)
  }

  async #delete(key: string) {
    return await this.#transact(async (store) => {
      return await new Promise<void>((ok, err) => {
        const req = store.delete(key)

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

    this.#keys.delete(key)
    this.#delete(key)
  }

}