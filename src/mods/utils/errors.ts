export function isAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === "AbortError"
}