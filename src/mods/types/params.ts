import { Normalizer } from "mods/types/normalizer.js"
import { Serializer } from "mods/types/serializer.js"
import { Storage } from "mods/types/storage.js"
import { Equals } from "mods/utils/equals.js"

export interface Params<D = any, E = any, K = any> {
  storage?: Storage
  serializer?: Serializer<K>,
  normalizer?: Normalizer<D, E, K>
  equals?: Equals,
  cooldown?: number
  expiration?: number
  timeout?: number,
}
