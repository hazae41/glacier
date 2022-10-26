'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

function refEquals(a, b) {
    return a === b;
}
function jsonEquals(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    return JSON.stringify(a) === JSON.stringify(b);
}
function shallowEquals(a, b) {
    var e_1, _a;
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    var ka = Object.keys(a);
    var kb = Object.keys(b);
    if (ka.length !== kb.length)
        return false;
    try {
        for (var ka_1 = tslib.__values(ka), ka_1_1 = ka_1.next(); !ka_1_1.done; ka_1_1 = ka_1.next()) {
            var key = ka_1_1.value;
            if (a[key] !== b[key])
                return false;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (ka_1_1 && !ka_1_1.done && (_a = ka_1.return)) _a.call(ka_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return true;
}

exports.jsonEquals = jsonEquals;
exports.refEquals = refEquals;
exports.shallowEquals = shallowEquals;
//# sourceMappingURL=equals.js.map
