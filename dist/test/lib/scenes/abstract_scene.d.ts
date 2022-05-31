import tmp from 'tmp';
import { TContext } from '../../../src/lib/context';
import { GitRepo } from '../../../src/lib/utils/git_repo';
export declare abstract class AbstractScene {
    tmpDir: tmp.DirResult;
    repo: GitRepo;
    dir: string;
    oldDir: string;
    context: TContext;
    constructor();
    abstract toString(): string;
    setup(): void;
    cleanup(): void;
}
