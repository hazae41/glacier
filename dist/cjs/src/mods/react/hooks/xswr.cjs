'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('../contexts/core.cjs');
var React = require('react');

function useXSWR() {
    var core$1 = core.useCore();
    var make = React.useCallback(function (schema) {
        return schema.make(core$1);
    }, [core$1]);
    return { core: core$1, make: make };
}

exports.useXSWR = useXSWR;
