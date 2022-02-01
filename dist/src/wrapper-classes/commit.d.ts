export default class Commit {
    sha: string;
    constructor(sha: string);
    parents(): Commit[];
    private messageImpl;
    messageRaw(): string;
    messageSubject(): string;
    messageBody(): string;
}
