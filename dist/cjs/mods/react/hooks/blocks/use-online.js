'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('../../../../libs/react.js');
var React = require('react');

/**
 * Do a request when the browser is online
 * @param query
 */
function useOnline(query) {
    var ready = query.ready, fetch = query.fetch;
    var fetchRef = react.useAutoRef(fetch);
    React.useEffect(function () {
        if (!ready)
            return;
        var f = function () { return fetchRef.current(); };
        addEventListener("online", f);
        return function () { return removeEventListener("online", f); };
    }, [ready]);
}

exports.useOnline = useOnline;
//# sourceMappingURL=use-online.js.map
