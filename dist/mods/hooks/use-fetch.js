"use strict";
exports.__esModule = true;
exports.useFetch = void 0;
var react_1 = require("react");
/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useFetch(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        fetch();
    }, [fetch]);
}
exports.useFetch = useFetch;
