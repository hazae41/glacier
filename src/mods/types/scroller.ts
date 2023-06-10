export type Scroller<D = unknown, K = unknown> =
  (previousPage?: D) => K | undefined