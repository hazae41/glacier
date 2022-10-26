import { useRef } from 'react';

function useAutoRef(current) {
    var ref = useRef(current);
    ref.current = current;
    return ref;
}

export { useAutoRef };
//# sourceMappingURL=react.js.map
