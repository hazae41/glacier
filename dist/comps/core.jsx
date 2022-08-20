"use strict";
exports.__esModule = true;
exports.CoreProvider = exports.useCoreProvider = exports.useCore = exports.CoreContext = void 0;
var react_1 = require("react");
var mod_1 = require("../mod");
exports.CoreContext = (0, react_1.createContext)(undefined);
function useCore() {
    return (0, react_1.useContext)(exports.CoreContext);
}
exports.useCore = useCore;
function useCoreProvider(storage, equals) {
    var core = (0, react_1.useRef)();
    if (!core.current)
        core.current = new mod_1.Core(storage, equals);
    return core.current;
}
exports.useCoreProvider = useCoreProvider;
function CoreProvider(props) {
    var storage = props.storage, equals = props.equals, children = props.children;
    var core = useCoreProvider(storage, equals);
    return <exports.CoreContext.Provider value={core}>
    {children}
  </exports.CoreContext.Provider>;
}
exports.CoreProvider = CoreProvider;
