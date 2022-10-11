import { useEffect } from 'react';

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
function useInterval(handle, interval) {
    var ready = handle.ready, fetch = handle.fetch;
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
