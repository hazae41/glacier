export interface State<D = any, E = any> {
    data?: D;
    error?: E;
    time?: number;
    aborter?: AbortController;
    cooldown?: number;
    expiration?: number;
}
