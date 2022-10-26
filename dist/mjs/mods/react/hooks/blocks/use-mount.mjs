import { useEffect } from 'react';

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param query
 */
function useMount(query) {
    var fetch = query.fetch;
    useEffect(function () {
        fetch();
    }, []);
}

export { useMount };
//# sourceMappingURL=use-mount.mjs.map
