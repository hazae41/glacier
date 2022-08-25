"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreProvider = exports.useCoreProvider = exports.useCore = exports.CoreContext = void 0;
const react_1 = __importStar(require("react"));
const mod_1 = require("../mod");
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
    return react_1.default.createElement(exports.CoreContext.Provider, { value: core }, children);
}
exports.CoreProvider = CoreProvider;
