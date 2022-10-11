'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var core = require('../../core.cjs');
var React = require('react');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

var CoreContext = React.createContext(undefined);
function useCore() {
    var core = React.useContext(CoreContext);
    if (core === undefined)
        throw new Error("Undefined core");
    return core;
}
function useCoreProvider(params) {
    var coreRef = React.useRef();
    if (coreRef.current === undefined)
        coreRef.current = new core.Core(params);
    React.useEffect(function () { return function () {
        var _a;
        (_a = coreRef.current) === null || _a === void 0 ? void 0 : _a.unmount();
    }; }, []);
    return coreRef.current;
}
function CoreProvider(props) {
    var children = props.children, params = tslib.__rest(props, ["children"]);
    var core = useCoreProvider(params);
    return React__namespace.createElement(CoreContext.Provider, { value: core }, children);
}

exports.CoreContext = CoreContext;
exports.CoreProvider = CoreProvider;
exports.useCore = useCore;
exports.useCoreProvider = useCoreProvider;
