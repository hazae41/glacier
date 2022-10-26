import { useAutoRef } from '../../../../libs/react.js';
import { useEffect } from 'react';

/**
 * Do a request when the browser is online
 * @param query
 */
function useOnline(query) {
    var ready = query.ready, fetch = query.fetch;
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
//# sourceMappingURL=use-online.js.map
