export declare type Unpacked<T> = T extends (infer U)[] ? U : never;
