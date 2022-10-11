import { Result } from './result.js';
import { State } from './state.js';

declare type Updater<D = any, E = any, K = any> = (previous: State<D, E, K> | undefined, more: UpdaterMore<D, E, K>) => AsyncGenerator<Result<D, E, K>, Result<D, E, K> | void>;
interface UpdaterMore<D = any, E = any, K = any> {
    signal?: AbortSignal;
}
interface UpdaterParams<D = any, E = any, K = any> {
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}

export { Updater, UpdaterMore, UpdaterParams };
