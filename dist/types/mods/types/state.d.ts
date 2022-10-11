interface State<D = any, E = any, K = any> {
    data?: D;
    error?: E;
    time?: number;
    aborter?: AbortController;
    optimistic?: boolean;
    cooldown?: number;
    expiration?: number;
    realData?: D;
}

export { State };
