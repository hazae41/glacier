"use strict";
exports.__esModule = true;
exports.useXSWR = exports.XSWR = void 0;
var react_1 = require("react");
var mod_1 = require("./mod");
exports.XSWR = require("./mod");
function useXSWR() {
    return (0, react_1.useContext)(mod_1.CoreContext);
}
exports.useXSWR = useXSWR;
