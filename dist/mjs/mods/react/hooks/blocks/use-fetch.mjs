import { useEffect } from 'react';

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useFetch(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        fetch();
    }, [fetch]);
}

export { useFetch };
//# sourceMappingURL=use-fetch.mjs.map
