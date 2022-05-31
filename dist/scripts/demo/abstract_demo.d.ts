export declare abstract class AbstractDemo {
    name: string;
    commands: string[];
    setup: (_dir: string) => void;
    constructor(name: string, commands: string[], setup: (dir: string) => void);
    outputFilePath(): string;
    outputSvgPath(): string;
    outputGifPath(): string;
    private record;
    create(): Promise<void>;
    private postProcess;
}
