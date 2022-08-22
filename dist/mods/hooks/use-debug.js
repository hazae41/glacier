"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebug = void 0;
const react_1 = require("react");
/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    const { time } = handle;
    (0, react_1.useEffect)(() => {
        console.debug(label, handle);
    }, [time]);
}
exports.useDebug = useDebug;
