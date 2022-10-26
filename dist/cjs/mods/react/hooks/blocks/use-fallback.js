'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query
 * @param state
 */
function useFallback(query, state) {
    var data = query.data, error = query.error;
    if (data !== undefined)
        return;
    if (error !== undefined)
        return;
    Object.assign(query, state);
}

exports.useFallback = useFallback;
//# sourceMappingURL=use-fallback.js.map
