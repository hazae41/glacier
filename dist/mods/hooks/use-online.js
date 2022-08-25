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
        const f = () => fetch();
        addEventListener("online", f);
        return () => removeEventListener("online", f);
    }, [fetch]);
}
exports.useOnline = useOnline;
