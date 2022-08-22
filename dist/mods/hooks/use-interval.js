"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInterval = void 0;
const react_1 = require("react");
/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
function useInterval(handle, interval) {
    const { fetch } = handle;
    (0, react_1.useEffect)(() => {
        if (!interval)
            return;
        const i = setInterval(fetch, interval);
        return () => clearInterval(i);
    }, [fetch, interval]);
}
exports.useInterval = useInterval;
