import { Result } from "./result";
export declare type Poster<D extends N = any, E = any, N = D, K = any> = (key: K, more: PosterMore) => Promise<Result<D, E, N, K>>;
export declare type PosterMore<D extends N = any, E = any, N = D, K = any> = {
    signal: AbortSignal;
    data?: D;
};
