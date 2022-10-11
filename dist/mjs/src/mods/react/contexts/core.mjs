import { __rest } from '../../../../node_modules/tslib/tslib.es6.mjs';
import { Core } from '../../core.mjs';
import * as React from 'react';
import { createContext, useContext, useRef, useEffect } from 'react';

var CoreContext = createContext(undefined);
function useCore() {
    var core = useContext(CoreContext);
    if (core === undefined)
        throw new Error("Undefined core");
    return core;
}
function useCoreProvider(params) {
    var coreRef = useRef();
    if (coreRef.current === undefined)
        coreRef.current = new Core(params);
    useEffect(function () { return function () {
        var _a;
        (_a = coreRef.current) === null || _a === void 0 ? void 0 : _a.unmount();
    }; }, []);
    return coreRef.current;
}
function CoreProvider(props) {
    var children = props.children, params = __rest(props, ["children"]);
    var core = useCoreProvider(params);
    return React.createElement(CoreContext.Provider, { value: core }, children);
}

export { CoreContext, CoreProvider, useCore, useCoreProvider };
