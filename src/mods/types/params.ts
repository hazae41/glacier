import { Equalser } from "mods/equals/equals.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Serializer } from "mods/types/serializer.js"

export interface Params<D = any, E = any, K = any> {
  storage?: Storage
  serializer?: Serializer<K>,
  normalizer?: Normalizer<D, E, K>
  equals?: Equalser,
  cooldown?: number
  expiration?: number
  timeout?: number,
}
