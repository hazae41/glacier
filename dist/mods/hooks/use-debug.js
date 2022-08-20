"use strict";
exports.__esModule = true;
exports.useDebug = void 0;
var react_1 = require("react");
/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var time = handle.time;
    (0, react_1.useEffect)(function () {
        console.debug(label, handle);
    }, [time]);
}
exports.useDebug = useDebug;
