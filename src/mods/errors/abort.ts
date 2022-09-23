export class AbortError extends Error {
  constructor(signal: AbortSignal) {
    super(`Aborted: ${signal.reason}`, { cause: signal })
  }
}

export function isAbortError(e: unknown): e is AbortError | DOMException {
  if (e instanceof AbortError)
    return true
  if (e instanceof DOMException && e.name === "AbortError")
    return true
  return false
}
