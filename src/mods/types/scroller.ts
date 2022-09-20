export type Scroller<D extends N = any, E = any, N = D, K = any> =
  (previous?: N) => K | undefined