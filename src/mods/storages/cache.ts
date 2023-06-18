import { Optional } from "@hazae41/option";
import { RawState } from "index.js";
import { Storage } from "./storage.js";

export class RawCache implements Storage {

  readonly cache = new Map<string, Optional<RawState>>()

  constructor(
    readonly storage?: Storage
  ) { }

  async get(cacheKey: string): Promise<Optional<RawState>> {
    const cached = this.cache.get(cacheKey)

    if (cached !== undefined)
      return cached

    return await this.storage?.get(cacheKey)
  }

  async set(cacheKey: string, value: Optional<RawState>): Promise<void> {
    this.cache.set(cacheKey, value)
    this.storage?.set(cacheKey, value)
  }

}