import { Result } from "./result";
export declare type Poster<D = any, E = any, N extends D = D, K = any> = (key: K, more: PosterMore) => Promise<Result<D, E, N, K>>;
export declare type PosterMore<D = any, E = any, N extends D = D, K = any> = {
    signal: AbortSignal;
    data?: D;
};
