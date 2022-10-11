'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('../../../../libs/react.cjs');
var React = require('react');

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
    var ready = handle.ready, skey = handle.skey, refetch = handle.refetch, error = handle.error;
    var _a = options.init, init = _a === void 0 ? 1000 : _a, _b = options.base, base = _b === void 0 ? 2 : _b, _c = options.max, max = _c === void 0 ? 3 : _c;
    var count = React.useRef(0);
    React.useEffect(function () {
        count.current = 0;
    }, [skey]);
    var refetchRef = react.useAutoRef(refetch);
    React.useEffect(function () {
        if (!ready)
            return;
        if (error === undefined) {
            count.current = 0;
            return;
        }
        if (count.current >= max)
            return;
        var ratio = Math.pow(base, count.current);
        function f() {
            count.current++;
            refetchRef.current();
        }
        var t = setTimeout(f, init * ratio);
        return function () { return clearTimeout(t); };
    }, [ready, error]);
}

exports.useRetry = useRetry;
//# sourceMappingURL=use-retry.cjs.map
