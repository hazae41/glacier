import { FullState } from "./state.js"

export type OptimisticYield<D = unknown> =
  (previous?: FullState<D>) => OptimisticDataInit<D>

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

export interface OptimisticParams {
  action: "set" | "unset",
  uuid: string
}