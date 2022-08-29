import { Serializer } from "mods/types/serializer"
import { State } from "mods/types/state"
import { Storage } from "mods/types/storage"
import { Equals } from "mods/utils/equals"

export interface Params<D = any, E = any, K = any> {
  storage?: Storage<State<D, E>>
  serializer?: Serializer<K>,
  equals?: Equals,
  cooldown?: number
  expiration?: number
  timeout?: number
}
