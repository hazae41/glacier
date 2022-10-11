'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function useAutoRef(current) {
    var ref = React.useRef(current);
    ref.current = current;
    return ref;
}

exports.useAutoRef = useAutoRef;
