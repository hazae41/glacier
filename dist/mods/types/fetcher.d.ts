import { Result } from "./result";
export declare type Fetcher<D = any, K = any> = (key: K, more: FetcherMore) => Promise<Result<D>>;
export declare type FetcherMore<D = any> = {
    signal: AbortSignal;
};
