import { useEffect } from 'react';

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useMount(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        fetch();
    }, []);
}

export { useMount };
