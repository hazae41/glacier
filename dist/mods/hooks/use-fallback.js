"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFallback = void 0;
/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param handle
 * @param state
 */
function useFallback(handle, state) {
    const { data, error } = handle;
    if (data !== undefined)
        return;
    if (error !== undefined)
        return;
    Object.assign(handle, state);
}
exports.useFallback = useFallback;
