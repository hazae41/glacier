"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRetry = void 0;
const react_1 = require("react");
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
function useRetry(handle, options = {}) {
    const { refetch, error, time } = handle;
    const { init = 1000, base = 2, max = 3 } = options;
    const count = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        count.current = 0;
    }, [refetch]);
    (0, react_1.useEffect)(() => {
        if (error === undefined) {
            count.current = 0;
            return;
        }
        if (count.current >= max)
            return;
        const ratio = base ** count.current;
        const f = () => { count.current++; refetch(); };
        const t = setTimeout(f, init * ratio);
        return () => clearTimeout(t);
    }, [error, time, refetch]);
}
exports.useRetry = useRetry;
