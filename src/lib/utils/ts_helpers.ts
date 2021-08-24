export type Unpacked<T extends any[]> = T extends (infer U)[] ? U : never;
