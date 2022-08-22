"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useError = void 0;
const react_1 = require("react");
/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    const { error } = handle;
    (0, react_1.useEffect)(() => {
        if (error !== undefined)
            callback(error);
    }, [error, callback]);
}
exports.useError = useError;
