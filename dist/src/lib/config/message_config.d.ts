declare type TMessageConfig = {
    message?: TMessage;
};
declare type TMessage = {
    contents: string;
    cliVersion: string;
};
declare class MessageConfig {
    _data: TMessageConfig;
    constructor(data: TMessageConfig);
    setMessage(message: TMessage | undefined): void;
    getMessage(): TMessage | undefined;
    path(): string;
    private save;
}
export declare function readMessageConfigForTestingOnly(): MessageConfig;
declare const messageConfigSingleton: MessageConfig;
export default messageConfigSingleton;
