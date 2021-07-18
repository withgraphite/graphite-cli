export default class Commit {
    sha: string;
    constructor(sha: string);
    parents(): Commit[];
    setParent(commit: Commit): void;
}
