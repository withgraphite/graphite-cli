export declare type TCacheLock = {
    lock: () => void;
    release: () => void;
};
export declare function getCacheLock(): TCacheLock;
