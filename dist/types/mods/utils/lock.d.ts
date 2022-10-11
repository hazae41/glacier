declare class Lock {
    private mutex?;
    lock<T>(callback: () => Promise<T>): Promise<T>;
}

export { Lock };
