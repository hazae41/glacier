import { useAutoRef } from '../../../../libs/react.js';
import { useEffect } from 'react';

/**
 * Do a request when the tab is visible
 * @param query
 */
function useVisible(query) {
    var ready = query.ready, fetch = query.fetch;
    var fetchRef = useAutoRef(fetch);
    useEffect(function () {
        if (!ready)
            return;
        var f = function () { return !document.hidden && fetchRef.current(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [ready]);
}

export { useVisible };
//# sourceMappingURL=use-visible.js.map
