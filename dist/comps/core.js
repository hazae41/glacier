"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreProvider = exports.useCoreProvider = exports.useCore = exports.CoreContext = void 0;
const react_1 = require("react");
const mod_1 = require("../mod");
const react_2 = __importDefault(require("react"));
exports.CoreContext = (0, react_1.createContext)(undefined);
function useCore() {
    return (0, react_1.useContext)(exports.CoreContext);
}
exports.useCore = useCore;
function useCoreProvider(storage, equals) {
    const core = (0, react_1.useRef)();
    if (!core.current)
        core.current = new mod_1.Core(storage, equals);
    return core.current;
}
exports.useCoreProvider = useCoreProvider;
function CoreProvider(props) {
    const { storage, equals, children } = props;
    const core = useCoreProvider(storage, equals);
    return react_2.default.createElement(exports.CoreContext.Provider, { value: core }, children);
}
exports.CoreProvider = CoreProvider;
