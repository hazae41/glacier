'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Show query in console when it changes
 * @param query
 */
function useDebug(query, label) {
    var data = query.data, error = query.error, time = query.time;
    React.useEffect(function () {
        console.debug(label, query);
    }, [data, error, time]);
}

exports.useDebug = useDebug;
//# sourceMappingURL=use-debug.js.map
