import { Core } from '../core.js';
import { Instance } from './instance.js';

interface Schema<D = any, E = any, K = any, O extends Instance<D, E, K> = Instance<D, E, K>> {
    make(core: Core): O;
}

export { Schema };
