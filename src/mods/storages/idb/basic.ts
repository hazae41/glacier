import { Optional } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Identity } from "index.js"
import { AsyncStorage, AsyncStorageSettings } from "mods/storages/storage.js"
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

export class IDBStorage implements AsyncStorage<string, unknown> {

  readonly async = true as const

  readonly #database: Promise<IDBDatabase>

  readonly #onunload: () => void

  #keys = new Map<string, number>()

  private constructor(
    readonly name = "xswr"
  ) {
    this.#database = this.#load()

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

    await this.#transact(database, async store => {
      const keys = await this.#get<[string, number][]>(store, "__keys")

      if (keys === undefined)
        return

      this.#keys = new Map(keys)

      await this.#delete(store, "__keys").catch(console.error)
      await this.#collect(store).catch(console.error)
    }, "readwrite")

    return database
  }

  async unmount() {
    removeEventListener("beforeunload", this.#onunload)

    await this.collect()
  }

  /**
   * Save the garbage collector keys
   */
  async #unload() {
    await this.#transact(await this.#database, async store => {
      await this.#set(store, "__keys", [...this.#keys])
    }, "readwrite")
  }

  async #collect(store: IDBObjectStore) {
    for (const [key, expiration] of this.#keys) {
      if (expiration > Date.now())
        continue
      this.#keys.delete(key)
      await this.#delete(store, key)
    }
  }

  async collect() {
    await this.#transact(await this.#database, async store => {
      return await this.#collect(store)
    }, "readwrite")
  }

  async #transact<T>(database: IDBDatabase, callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode) {
    const transaction = database.transaction("keyval", mode)
    const store = transaction.objectStore("keyval")

    try {
      const result = await callback(store)
      transaction.commit()
      return result
    } catch (e: unknown) {
      transaction.abort()
      throw e
    }
  }

  #get<T>(store: IDBObjectStore, key: string) {
    return new Promise<Optional<T>>((ok, err) => {
      const req = store.get(key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok(req.result)
    })
  }

  async get<D, F>(cacheKey: string, settings: AsyncStorageSettings<D, F, string, unknown>) {
    const { keySerializer = Identity, valueSerializer = Identity } = settings

    const key = await keySerializer.stringify(cacheKey)

    const value = await this.#transact(await this.#database, async store => {
      return await this.#get(store, key)
    }, "readonly")

    if (value === undefined)
      return undefined

    const state = await valueSerializer.parse(value) as StoredState<D, F>

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return state
  }

  #set<T>(store: IDBObjectStore, key: string, value: T) {
    return new Promise<void>((ok, err) => {
      const req = store.put(value, key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async set<D, F>(cacheKey: string, state: StoredState<D, F>, settings: AsyncStorageSettings<D, F, string, unknown>) {
    const { keySerializer = Identity, valueSerializer = Identity } = settings

    const key = await keySerializer.stringify(cacheKey)
    const value = await valueSerializer.stringify(state)

    if (state.expiration !== undefined)
      this.#keys.set(key, state.expiration)

    return await this.#transact(await this.#database, async store => {
      return await this.#set(store, key, value)
    }, "readwrite")
  }

  #delete(store: IDBObjectStore, key: string) {
    return new Promise<void>((ok, err) => {
      const req = store.delete(key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async delete<D, F>(cacheKey: string, settings: AsyncStorageSettings<D, F, string, unknown>) {
    const { keySerializer = Identity } = settings

    const key = await keySerializer.stringify(cacheKey)

    this.#keys.delete(key)

    await this.#transact(await this.#database, async store => {
      await this.#delete(store, key)
    }, "readwrite")
  }

}