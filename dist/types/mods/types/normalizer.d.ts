import { Core } from '../core.js';
import { State } from './state.js';

declare type Normalizer<D = any, E = any, K = any> = (data: D, more: NormalizerMore<D, E, K>) => Promise<D>;
interface NormalizerMore<D = any, E = any, K = any> {
    core: Core;
    shallow: boolean;
    root: State<D, E, K>;
}

export { Normalizer, NormalizerMore };
