import { Equalser } from "mods/equals/equals.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Serializer } from "mods/types/serializer.js"

export interface GlobalParams {
  storage?: Storage
  equals?: Equalser,
  cooldown?: number
  expiration?: number
  timeout?: number,
}

export interface Params<D = unknown, K = unknown> {
  storage?: Storage
  serializer?: Serializer<K>,
  normalizer?: Normalizer<D>
  equals?: Equalser,
  cooldown?: number
  expiration?: number
  timeout?: number,
}
