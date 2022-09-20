import { Normalizer } from "./normalizer";
import { Serializer } from "./serializer";
import { Storage } from "./storage";
import { Equals } from "../utils/equals";
export interface Params<D = any, E = any, N extends D = D, K = any> {
    storage?: Storage;
    serializer?: Serializer<K>;
    normalizer?: Normalizer<D, E, N, K>;
    equals?: Equals;
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}
