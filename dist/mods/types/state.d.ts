export interface State<D = any, E = any> {
    count?: number;
    data?: D;
    error?: E;
    time?: number;
    aborter?: AbortController;
    optimistic?: boolean;
    cooldown?: number;
    expiration?: number;
}
