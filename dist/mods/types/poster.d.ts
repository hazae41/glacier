import { Result } from "./result";
export declare type Poster<D = any, K = any> = (key: K, more: PosterMore) => Promise<Result<D>>;
export declare type PosterMore<D = any> = {
    signal: AbortSignal;
    data?: D;
};
