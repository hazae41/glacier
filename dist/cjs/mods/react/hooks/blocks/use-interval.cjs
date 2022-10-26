'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param query
 * @param interval
 */
function useInterval(query, interval) {
    var ready = query.ready, fetch = query.fetch;
    React.useEffect(function () {
        if (!ready)
            return;
        if (!interval)
            return;
        var i = setInterval(fetch, interval);
        return function () { return clearInterval(i); };
    }, [fetch, interval]);
}

exports.useInterval = useInterval;
//# sourceMappingURL=use-interval.cjs.map
