import { useEffect } from 'react';

/**
 * Call a function on error
 * @param query
 * @param callback
 */
function useError(query, callback) {
    var error = query.error;
    useEffect(function () {
        if (error !== undefined)
            callback(error);
    }, [error]);
}

export { useError };
//# sourceMappingURL=use-error.js.map
