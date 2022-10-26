'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Call a function on error
 * @param query
 * @param callback
 */
function useError(query, callback) {
    var error = query.error;
    React.useEffect(function () {
        if (error !== undefined)
            callback(error);
    }, [error]);
}

exports.useError = useError;
//# sourceMappingURL=use-error.cjs.map
