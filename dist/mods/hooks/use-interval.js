"use strict";
exports.__esModule = true;
exports.useInterval = void 0;
var react_1 = require("react");
/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
function useInterval(handle, interval) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        if (!interval)
            return;
        var i = setInterval(fetch, interval);
        return function () { return clearInterval(i); };
    }, [fetch, interval]);
}
exports.useInterval = useInterval;
