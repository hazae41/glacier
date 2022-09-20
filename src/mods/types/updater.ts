export type Updater<D = any, E = any, N extends D = D, K = any> =
  (previous?: D) => D