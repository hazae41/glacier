"use strict";
exports.__esModule = true;
exports.useOnce = void 0;
var react_1 = require("react");
/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(handle) {
    var data = handle.data, fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        if (!data)
            fetch();
    }, [data, fetch]);
}
exports.useOnce = useOnce;
