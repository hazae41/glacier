export declare class AbortError extends Error {
    constructor(signal: AbortSignal);
}
export declare function isAbortError(e: unknown): e is DOMException;
