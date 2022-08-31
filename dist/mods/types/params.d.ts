import { Serializer } from "./serializer";
import { Storage } from "./storage";
import { Equals } from "../utils/equals";
export interface Params<D = any, E = any, K = any> {
    storage?: Storage;
    serializer?: Serializer<K>;
    equals?: Equals;
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}
