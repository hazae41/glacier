import { Normalizer } from "mods/types/normalizer"
import { Serializer } from "mods/types/serializer"
import { Storage } from "mods/types/storage"
import { Equals } from "mods/utils/equals"

export interface Params<D = any, E = any, K = any> {
  storage?: Storage
  serializer?: Serializer<K>,
  normalizer?: Normalizer<D, E, K>
  equals?: Equals,
  cooldown?: number
  expiration?: number
  timeout?: number,
}
