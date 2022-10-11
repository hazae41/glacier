declare class AbortError extends Error {
    constructor(signal: AbortSignal);
}
declare function isAbortError(e: unknown): e is AbortError | DOMException;

export { AbortError, isAbortError };
