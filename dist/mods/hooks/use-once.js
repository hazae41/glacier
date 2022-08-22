"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnce = void 0;
const react_1 = require("react");
/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(handle) {
    const { data, fetch } = handle;
    (0, react_1.useEffect)(() => {
        if (data === undefined)
            fetch();
    }, [data, fetch]);
}
exports.useOnce = useOnce;
