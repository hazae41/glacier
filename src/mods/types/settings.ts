import { Equalser } from "mods/equals/equals.js"
import { Bicoder, SyncEncoder } from "mods/serializers/serializer.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Indexer } from "./indexer.js"

export interface GlobalSettings {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number
}

export interface QuerySettings<K, D, F> {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly keySerializer?: SyncEncoder<K, string>,

  readonly dataSerializer?: Bicoder<D, unknown>
  readonly errorSerializer?: Bicoder<F, unknown>

  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly dataEqualser?: Equalser<D>,
  readonly errorEqualser?: Equalser<F>

  readonly storage?: Storage
}
