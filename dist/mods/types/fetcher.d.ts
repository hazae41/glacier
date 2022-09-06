import { Result } from "./result";
export declare type Fetcher<D = any, E = any, N = D, K = any> = (key: K, more: FetcherMore) => Promise<Result<D, E, N, K>>;
export declare type FetcherMore<D = any, E = any, N = D, K = any> = {
    signal: AbortSignal;
};
