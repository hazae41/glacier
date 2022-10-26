import { useEffect } from 'react';

/**
 * Show query in console when it changes
 * @param query
 */
function useDebug(query, label) {
    var data = query.data, error = query.error, time = query.time;
    useEffect(function () {
        console.debug(label, query);
    }, [data, error, time]);
}

export { useDebug };
//# sourceMappingURL=use-debug.js.map
