import { Core } from '../core.js';
import { Object as Object$1 } from './object.js';

interface Schema<D = any, E = any, K = any, O extends Object$1<D, E, K> = Object$1<D, E, K>> {
    make(core: Core): O;
}

export { Schema };
