export interface State<D = any, E = any, N = D, K = any> {
    data?: N;
    error?: E;
    time?: number;
    aborter?: AbortController;
    optimistic?: boolean;
    cooldown?: number;
    expiration?: number;
}
