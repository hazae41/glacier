'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param query
 */
function useFetch(query) {
    var fetch = query.fetch;
    React.useEffect(function () {
        fetch();
    }, [fetch]);
}

exports.useFetch = useFetch;
//# sourceMappingURL=use-fetch.cjs.map
