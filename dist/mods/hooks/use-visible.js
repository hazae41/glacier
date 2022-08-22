"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVisible = void 0;
const react_1 = require("react");
/**
 * Do a request when the tab is visible
 * @param handle
 */
function useVisible(handle) {
    const { fetch } = handle;
    (0, react_1.useEffect)(() => {
        const f = () => !document.hidden && fetch();
        document.addEventListener("visibilitychange", f);
        return () => document.removeEventListener("visibilitychange", f);
    }, [fetch]);
}
exports.useVisible = useVisible;
