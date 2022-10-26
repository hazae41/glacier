'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param query
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(query) {
    var data = query.data, fetch = query.fetch;
    React.useEffect(function () {
        if (data === undefined)
            fetch();
    }, [data, fetch]);
}

exports.useOnce = useOnce;
//# sourceMappingURL=use-once.cjs.map
