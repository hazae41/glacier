"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMount = void 0;
const react_1 = require("react");
/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useMount(handle) {
    const { fetch } = handle;
    (0, react_1.useEffect)(() => {
        fetch();
    }, []);
}
exports.useMount = useMount;
