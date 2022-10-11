import { useAutoRef } from '../../../../libs/react.mjs';
import { useEffect } from 'react';

/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var ready = handle.ready, fetch = handle.fetch;
    var fetchRef = useAutoRef(fetch);
    useEffect(function () {
        if (!ready)
            return;
        var f = function () { return fetchRef.current(); };
        addEventListener("online", f);
        return function () { return removeEventListener("online", f); };
    }, [ready]);
}

export { useOnline };
