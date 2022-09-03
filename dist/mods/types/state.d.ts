export interface State<D = any, E = any> {
    data?: D;
    error?: E;
    count?: number;
    time?: number;
    aborter?: AbortController;
    optimistic?: boolean;
    cooldown?: number;
    expiration?: number;
}
