import { Handle } from '../../types/handle.js';

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
declare function useInterval(handle: Handle, interval: number): void;

export { useInterval };
