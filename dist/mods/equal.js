"use strict";
exports.__esModule = true;
exports.jsoneq = exports.jseq = void 0;
function jseq(a, b) {
    return a === b;
}
exports.jseq = jseq;
function jsoneq(a, b) {
    if (a === b)
        return true;
    return JSON.stringify(a) === JSON.stringify(b);
}
exports.jsoneq = jsoneq;
