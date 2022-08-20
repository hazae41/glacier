"use strict";
exports.__esModule = true;
exports.useRetry = void 0;
var react_1 = require("react");
/**
 * Retry request on error using exponential backoff
 * @see useInterval for interval based requests
 * @param handle
 * @param options
 * @param options.init Initial timeout to be multiplied (in milliseconds)
 * @param options.base Exponent base (2 means the next timeout will be 2 times longer)
 * @param options.max Maximum count (3 means do not retry after 3 retries)
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 * @see https://en.wikipedia.org/wiki/Geometric_progression
 */
function useRetry(handle, options) {
    if (options === void 0) { options = {}; }
    var refetch = handle.refetch, error = handle.error, time = handle.time;
    var _a = options.init, init = _a === void 0 ? 1000 : _a, _b = options.base, base = _b === void 0 ? 2 : _b, _c = options.max, max = _c === void 0 ? 3 : _c;
    var count = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        count.current = 0;
    }, [refetch, init, base, max]);
    (0, react_1.useEffect)(function () {
        if (!error) {
            count.current = 0;
            return;
        }
        if (count.current >= max)
            return;
        var ratio = Math.pow(base, count.current);
        var f = function () { count.current++; refetch(); };
        var t = setTimeout(f, init * ratio);
        return function () { return clearTimeout(t); };
    }, [error, time]);
}
exports.useRetry = useRetry;
