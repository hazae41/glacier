"use strict";
exports.__esModule = true;
exports.useError = void 0;
var react_1 = require("react");
/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var error = handle.error;
    (0, react_1.useEffect)(function () {
        if (error !== undefined)
            callback(error);
    }, [error, callback]);
}
exports.useError = useError;
