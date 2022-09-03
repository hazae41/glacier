export class AbortError extends Error {
  constructor(signal: AbortSignal) {
    super("Aborted", { cause: signal })
  }
}

export function isAbortError(e: unknown): e is DOMException {
  if (e instanceof AbortError)
    return true
  if (e instanceof DOMException && e.name === "AbortError")
    return true
  return false
}
