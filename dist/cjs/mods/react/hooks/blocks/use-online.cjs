'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('../../../../libs/react.cjs');
var React = require('react');

/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var ready = handle.ready, fetch = handle.fetch;
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
//# sourceMappingURL=use-online.cjs.map
