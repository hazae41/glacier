"use strict";
exports.__esModule = true;
exports.useVisible = void 0;
var react_1 = require("react");
/**
 * Do a request when the tab is visible
 * @param handle
 */
function useVisible(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        var f = function () { return !document.hidden && fetch(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [fetch]);
}
exports.useVisible = useVisible;
