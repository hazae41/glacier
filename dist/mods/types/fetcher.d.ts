import { Result } from "./result";
export declare type Fetcher<D = any, E = any, K = any> = (key: K, more: FetcherMore) => Promise<Result<D, E>>;
export declare type FetcherMore<D = any> = {
    signal: AbortSignal;
};
