'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('../../../../libs/react.cjs');
var React = require('react');

/**
 * Do a request when the tab is visible
 * @param query
 */
function useVisible(query) {
    var ready = query.ready, fetch = query.fetch;
    var fetchRef = react.useAutoRef(fetch);
    React.useEffect(function () {
        if (!ready)
            return;
        var f = function () { return !document.hidden && fetchRef.current(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [ready]);
}

exports.useVisible = useVisible;
//# sourceMappingURL=use-visible.cjs.map
