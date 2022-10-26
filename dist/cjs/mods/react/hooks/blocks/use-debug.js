'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var data = handle.data, error = handle.error, time = handle.time;
    React.useEffect(function () {
        console.debug(label, handle);
    }, [data, error, time]);
}

exports.useDebug = useDebug;
//# sourceMappingURL=use-debug.js.map
