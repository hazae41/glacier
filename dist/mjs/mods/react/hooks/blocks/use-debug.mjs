import { useEffect } from 'react';

/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var data = handle.data, error = handle.error, time = handle.time;
    useEffect(function () {
        console.debug(label, handle);
    }, [data, error, time]);
}

export { useDebug };
//# sourceMappingURL=use-debug.mjs.map
