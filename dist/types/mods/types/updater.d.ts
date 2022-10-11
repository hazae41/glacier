import { Result } from "./result.js";
import { State } from "./state.js";
export declare type Updater<D = any, E = any, K = any> = (previous: State<D, E, K> | undefined, more: UpdaterMore<D, E, K>) => AsyncGenerator<Result<D, E, K>, Result<D, E, K> | void>;
export interface UpdaterMore<D = any, E = any, K = any> {
    signal?: AbortSignal;
}
export interface UpdaterParams<D = any, E = any, K = any> {
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}
