'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param query
 */
function useMount(query) {
    var fetch = query.fetch;
    React.useEffect(function () {
        fetch();
    }, []);
}

exports.useMount = useMount;
//# sourceMappingURL=use-mount.js.map
