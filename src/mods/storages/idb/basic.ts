import { Optional } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Bicoder, Encoder, SyncIdentity } from "mods/serializers/serializer.js"
import { Storage } from "mods/storages/storage.js"
import { RawState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { StorageCreationError } from "../errors.js"

export function useIDBStorage(params?: IDBStorageParams) {
  const storage = useRef<Result<IDBStorage, StorageCreationError>>()

  if (storage.current == null)
    storage.current = IDBStorage.tryCreate(params).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner.unmount().catch(console.error)
  }, [])

  return storage.current
}

export interface IDBStorageParams {
  name?: string,
  keySerializer?: Encoder<string, string>,
  valueSerializer?: Bicoder<RawState, string>
}

export class IDBStorage implements Storage {
  readonly async = true as const

  readonly #database: Promise<IDBDatabase>

  readonly #onunload: () => void

  #storageKeys = new Map<string, number>()

  private constructor(
    readonly name = "xswr",
    readonly keySerializer = SyncIdentity as Encoder<string, string>,
    readonly valueSerializer = SyncIdentity as Bicoder<RawState, unknown>
  ) {
    this.#database = this.#load()

    this.#onunload = () => this.#unload()
    addEventListener("beforeunload", this.#onunload)
  }

  static tryCreate(params: IDBStorageParams = {}): Result<IDBStorage, StorageCreationError> {
    const { name, keySerializer, valueSerializer } = params

    if (typeof indexedDB === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new IDBStorage(name, keySerializer, valueSerializer))
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

      if (keys == null)
        return

      this.#storageKeys = new Map(keys)

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
      await this.#set(store, "__keys", [...this.#storageKeys])
    }, "readwrite")
  }

  async #collect(store: IDBObjectStore) {
    for (const [key, expiration] of this.#storageKeys) {
      if (expiration > Date.now())
        continue
      this.#storageKeys.delete(key)
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

  async get(cacheKey: string) {
    const key = await this.keySerializer.stringify(cacheKey)

    const value = await this.#transact(await this.#database, async store => {
      return await this.#get(store, key)
    }, "readonly")

    if (value == null)
      return undefined

    const state = await this.valueSerializer.parse(value)

    if (state.expiration != null)
      this.#storageKeys.set(key, state.expiration)

    return state
  }

  #set<T>(store: IDBObjectStore, key: string, value: T) {
    return new Promise<void>((ok, err) => {
      const req = store.put(value, key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async set(cacheKey: string, state: Optional<RawState>) {
    if (state == null)
      return await this.delete(cacheKey)

    const storageKey = await this.keySerializer.stringify(cacheKey)
    const storageValue = await this.valueSerializer.stringify(state)

    if (state.expiration != null)
      this.#storageKeys.set(storageKey, state.expiration)

    return await this.#transact(await this.#database, async store => {
      return await this.#set(store, storageKey, storageValue)
    }, "readwrite")
  }

  #delete(store: IDBObjectStore, storageKey: string) {
    return new Promise<void>((ok, err) => {
      const req = store.delete(storageKey)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async delete(cacheKey: string) {
    const storageKey = await this.keySerializer.stringify(cacheKey)

    this.#storageKeys.delete(storageKey)

    await this.#transact(await this.#database, async store => {
      await this.#delete(store, storageKey)
    }, "readwrite")
  }

}