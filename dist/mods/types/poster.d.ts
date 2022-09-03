import { Result } from "./result";
export declare type Poster<D = any, E = any, K = any> = (key: K, more: PosterMore) => Promise<Result<D, E>>;
export declare type PosterMore<D = any> = {
    signal: AbortSignal;
    data?: D;
};
