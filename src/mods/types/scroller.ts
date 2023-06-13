export type Scroller<K, D, F> =
  (previousPage?: D) => K | undefined