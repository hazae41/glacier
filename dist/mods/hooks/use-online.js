"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnline = void 0;
const react_1 = require("react");
/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    const { fetch } = handle;
    (0, react_1.useEffect)(() => {
        addEventListener("online", fetch);
        return () => removeEventListener("online", fetch);
    }, [fetch]);
}
exports.useOnline = useOnline;
