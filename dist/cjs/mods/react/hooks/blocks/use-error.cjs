'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var error = handle.error;
    React.useEffect(function () {
        if (error !== undefined)
            callback(error);
    }, [error]);
}

exports.useError = useError;
//# sourceMappingURL=use-error.cjs.map
