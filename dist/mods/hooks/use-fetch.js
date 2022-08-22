"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetch = void 0;
const react_1 = require("react");
/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useFetch(handle) {
    const { fetch } = handle;
    (0, react_1.useEffect)(() => {
        fetch();
    }, [fetch]);
}
exports.useFetch = useFetch;
