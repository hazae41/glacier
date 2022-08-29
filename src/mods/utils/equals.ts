export type Equals =
  (a: unknown, b: unknown) => boolean

export function jseq(a: unknown, b: unknown) {
  return a === b
}

export function jsoneq(a: unknown, b: unknown) {
  if (a === b)
    return true
  return JSON.stringify(a) === JSON.stringify(b)
}