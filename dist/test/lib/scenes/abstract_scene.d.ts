import tmp from 'tmp';
import { GitRepo } from '../../../src/lib/utils';
export declare abstract class AbstractScene {
    tmpDir: tmp.DirResult;
    repo: GitRepo;
    dir: string;
    oldDir: string;
    constructor();
    abstract toString(): string;
    setup(): void;
    cleanup(): void;
}
