"use strict";
exports.__esModule = true;
exports.useOnline = void 0;
var react_1 = require("react");
/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        addEventListener("online", fetch);
        return function () { return removeEventListener("online", fetch); };
    }, [fetch]);
}
exports.useOnline = useOnline;
