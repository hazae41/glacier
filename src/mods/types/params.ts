import { Equalser } from "mods/equals/equals.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Serializer } from "mods/types/serializer.js"

export interface GlobalParams {
  readonly storage?: Storage
  readonly equals?: Equalser,
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,
}

export interface QueryParams<D = unknown, K = unknown> {
  readonly storage?: Storage
  readonly serializer?: Serializer<K>,
  readonly normalizer?: Normalizer<D>
  readonly equals?: Equalser,
  readonly cooldown?: number
  readonly expiration?: number
  readonly timeout?: number,
}
