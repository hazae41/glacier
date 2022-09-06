import { Schema } from "./schema";
export declare class Normal<D = any, E = any, N = D, K = any> {
    readonly data: D;
    readonly schema: Schema<D, E, N, K>;
    readonly result?: N | undefined;
    constructor(data: D, schema: Schema<D, E, N, K>, result?: N | undefined);
}
