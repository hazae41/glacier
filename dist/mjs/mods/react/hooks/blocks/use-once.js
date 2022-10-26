import { useEffect } from 'react';

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param query
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(query) {
    var data = query.data, fetch = query.fetch;
    useEffect(function () {
        if (data === undefined)
            fetch();
    }, [data, fetch]);
}

export { useOnce };
//# sourceMappingURL=use-once.js.map
