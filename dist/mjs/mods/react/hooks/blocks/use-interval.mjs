import { useEffect } from 'react';

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param query
 * @param interval
 */
function useInterval(query, interval) {
    var ready = query.ready, fetch = query.fetch;
    useEffect(function () {
        if (!ready)
            return;
        if (!interval)
            return;
        var i = setInterval(fetch, interval);
        return function () { return clearInterval(i); };
    }, [fetch, interval]);
}

export { useInterval };
//# sourceMappingURL=use-interval.mjs.map
