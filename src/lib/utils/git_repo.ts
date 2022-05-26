import fs from 'fs-extra';
import path from 'path';
import {
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from '../../wrapper-classes/metadata_ref';
import { USER_CONFIG_OVERRIDE_ENV } from '../context';
import { ExitFailedError } from '../errors';
import { rebaseInProgress } from '../git/rebase_in_progress';
import { gpExecSync } from './exec_sync';

const TEXT_FILE_NAME = 'test.txt';
export class GitRepo {
  dir: string;
  userConfigPath: string;
  constructor(
    dir: string,
    opts?: { existingRepo?: boolean; repoUrl?: string }
  ) {
    this.dir = dir;
    this.userConfigPath = path.join(dir, '.git/.graphite_user_config');
    if (opts?.existingRepo) {
      return;
    }
    if (opts?.repoUrl) {
      gpExecSync({
        command: `git clone ${opts.repoUrl} ${dir}`,
      });
    } else {
      gpExecSync({
        command: `git init ${dir} -b main`,
      });
    }
  }

  execCliCommand(command: string, opts?: { cwd?: string }): void {
    gpExecSync(
      {
        command: [
          `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
          `NODE_ENV=development`,
          `node ${__dirname}/../../../../dist/src/index.js ${command}`,
        ].join(' '),
        options: {
          stdio: process.env.DEBUG ? 'inherit' : 'ignore',
          cwd: opts?.cwd || this.dir,
        },
      },
      () => {
        throw new ExitFailedError('command failed');
      }
    );
  }

  execGitCommand(command: string, opts?: { cwd?: string }): void {
    gpExecSync({
      command: `git ${command}`,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
        cwd: opts?.cwd || this.dir,
      },
    });
  }

  execCliCommandAndGetOutput(command: string): string {
    return gpExecSync({
      command: [
        `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
        `NODE_ENV=development`,
        `node ${__dirname}/../../../../dist/src/index.js ${command}`,
      ].join(' '),
      options: {
        cwd: this.dir,
      },
    });
  }

  createChange(textValue: string, prefix?: string, unstaged?: boolean): void {
    const filePath = `${this.dir}/${
      prefix ? prefix + '_' : ''
    }${TEXT_FILE_NAME}`;
    fs.writeFileSync(filePath, textValue);
    if (!unstaged) {
      gpExecSync({ command: `git -C "${this.dir}" add ${filePath}` });
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    gpExecSync({ command: `git -C "${this.dir}" add .` });
    gpExecSync({ command: `git -C "${this.dir}" commit -m "${textValue}"` });
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    gpExecSync({ command: `git -C "${this.dir}" add .` });
    gpExecSync({ command: `git -C "${this.dir}" commit --amend --no-edit` });
  }

  deleteBranch(name: string): void {
    gpExecSync({ command: `git -C "${this.dir}" branch -D ${name}` });
  }

  createPrecommitHook(contents: string): void {
    fs.mkdirpSync(`${this.dir}/.git/hooks`);
    fs.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
    gpExecSync({ command: `chmod +x ${this.dir}/.git/hooks/pre-commit` });
  }

  createAndCheckoutBranch(name: string): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout -b "${name}"`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
    });
  }

  checkoutBranch(name: string): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout "${name}"`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
    });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ dir: this.dir });
  }

  resolveMergeConflicts(): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout --theirs .`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
    });
  }

  markMergeConflictsAsResolved(): void {
    gpExecSync({
      command: `git -C "${this.dir}" add .`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
    });
  }

  currentBranchName(): string {
    return gpExecSync({
      command: `git -C "${this.dir}" branch --show-current`,
    });
  }

  getRef(refName: string): string {
    return gpExecSync({
      command: `git -C "${this.dir}" show-ref -s ${refName}`,
    });
  }

  listCurrentBranchCommitMessages(): string[] {
    return gpExecSync({
      command: `git -C "${this.dir}" log --oneline  --format=%B`,
    })
      .split('\n')
      .filter((line) => line.length > 0);
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
      },
    });
  }

  upsertMeta(name: string, partialMeta: Partial<TMeta>): void {
    const meta = readMetadataRef(name, { dir: this.dir }) ?? {};
    writeMetadataRef(name, { ...meta, ...partialMeta }, { dir: this.dir });
  }
}
