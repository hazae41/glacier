import { Normalizer } from './normalizer.js';
import { Serializer } from './serializer.js';
import { Storage } from './storage.js';
import { Equals } from '../utils/equals.js';

interface Params<D = any, E = any, K = any> {
    storage?: Storage;
    serializer?: Serializer<K>;
    normalizer?: Normalizer<D, E, K>;
    equals?: Equals;
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}

export { Params };
