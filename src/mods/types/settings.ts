import { Equalser } from "mods/equals/equals.js"
import { Bicoder, SyncEncoder } from "mods/serializers/serializer.js"
import { Storage } from "mods/storages/storage.js"
import { Normalizer } from "mods/types/normalizer.js"
import { Fetcher } from "./fetcher.js"
import { Indexer } from "./indexer.js"
import { Scroller } from "./scroller.js"

export interface GlobalSettings {
  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number
}

export type QuerySettings<K, D, F> =
  | FetcherfulQuerySettings<K, D, F>
  | FetcherlessQuerySettings<K, D, F>

export interface FetcherfulQuerySettings<K, D, F> {
  readonly key: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly keySerializer?: SyncEncoder<K, string>,

  readonly dataSerializer?: Bicoder<D, unknown>
  readonly errorSerializer?: Bicoder<F, unknown>

  readonly fetcher: Fetcher<K, D, F>
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly dataEqualser?: Equalser<D>,
  readonly errorEqualser?: Equalser<F>

  readonly storage?: Storage
}

export interface FetcherlessQuerySettings<K, D, F> {
  readonly key: K

  readonly timeout?: number,
  readonly cooldown?: number,
  readonly expiration?: number

  readonly keySerializer?: SyncEncoder<K, string>,

  readonly dataSerializer?: Bicoder<D, unknown>
  readonly errorSerializer?: Bicoder<F, unknown>

  readonly fetcher?: undefined
  readonly normalizer?: Normalizer<D, F>
  readonly indexer?: Indexer<D, F>

  readonly dataEqualser?: Equalser<D>,
  readonly errorEqualser?: Equalser<F>

  readonly storage?: Storage
}

export interface ScrollQuerySettings<K, D, F> {
  readonly scroller: Scroller<K, D, F>
}