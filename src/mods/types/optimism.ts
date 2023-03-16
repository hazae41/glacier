import { State } from "./state.js"

// export type OptimisticResultInit<D = unknown> =
//   | OptimisticDataInit<D>
//   | OptimisticErrorInit

export interface OptimisticDataInit<D = unknown> {
  data: D
  time?: number
}

// export interface OptimisticErrorInit {
//   error: unknown,
//   time?: number
// }

export type Optimistic<D = unknown> =
  (previous?: State<D>) => OptimisticDataInit<D>