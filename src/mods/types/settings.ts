import { Equalser } from "mods/equals/equals.js"
import { Bicoder, SyncEncoder } from "mods/serializers/serializer.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"

export interface GlobalSettings {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly equals?: Equalser
}

export interface QuerySettings<K, D, F> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly storage?: Storage

  readonly keySerializer?: SyncEncoder<K, string>,

  readonly dataSerializer?: Bicoder<D, unknown>
  readonly errorSerializer?: Bicoder<F, unknown>

  readonly normalizer?: Normalizer<D, F>
  readonly equals?: Equalser,
}
