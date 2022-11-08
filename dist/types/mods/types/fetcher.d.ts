import { Result } from './result.js';

declare type Fetcher<D = any, E = any, K = any> = (key: K, more: FetcherMore) => Promise<Result<D, E, K>>;
interface FetcherMore {
    signal?: AbortSignal;
    cache?: "reload";
}

export { Fetcher, FetcherMore };
