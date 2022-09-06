import { Schema } from "./schema";

export class Normal<D = any, E = any, N = D, K = any> {
  constructor(
    readonly data: D,
    readonly schema: Schema<D, E, N, K>,
    readonly result?: N
  ) { }
}