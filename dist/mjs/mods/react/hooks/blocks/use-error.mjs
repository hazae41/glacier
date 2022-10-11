import { useEffect } from 'react';

/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var error = handle.error;
    useEffect(function () {
        if (error !== undefined)
            callback(error);
    }, [error]);
}

export { useError };
