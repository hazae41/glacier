"use strict";
exports.__esModule = true;
exports.useMount = void 0;
var react_1 = require("react");
/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useMount(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        fetch();
    }, []);
}
exports.useMount = useMount;
