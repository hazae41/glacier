export class AbortError extends DOMException {
  constructor() {
    super("Aborted", "AbortError")
  }
}

export function isAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === "AbortError"
}