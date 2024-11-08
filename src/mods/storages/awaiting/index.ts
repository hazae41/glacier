import { RawState } from "mods/types/state.js"
import { QueryStorage } from "../storage.js"

export class AwaitingQueryStorage<T extends QueryStorage> {

  constructor(
    readonly storage: Promise<T>,
  ) {
    storage.catch(console.error)
  }

  async getOrThrow(cacheKey: string) {
    return await this.storage.then(x => x.getOrThrow(cacheKey))
  }

  async setOrThrow(cacheKey: string, value: RawState) {
    return await this.storage.then(x => x.setOrThrow(cacheKey, value))
  }

}