import tmp from 'tmp';
import { GitRepo } from '../../../src/lib/utils/git_repo';
import { AbstractScene } from './abstract_scene';
export declare class CloneScene extends AbstractScene {
    originTmpDir: tmp.DirResult;
    originDir: string;
    originRepo: GitRepo;
    toString(): string;
    setup(): void;
    cleanup(): void;
}
