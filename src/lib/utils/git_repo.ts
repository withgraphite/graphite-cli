import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { MetadataRef, TMeta } from '../../wrapper-classes/metadata_ref';
import { USER_CONFIG_OVERRIDE_ENV } from '../context';
import { rebaseInProgress } from './rebase_in_progress';

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
      execSync(`git clone ${opts.repoUrl} ${dir}`);
    } else {
      execSync(`git init ${dir} -b main`);
    }
  }

  execCliCommand(command: string, opts?: { cwd?: string }): void {
    execSync(
      [
        `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
        `NODE_ENV=development`,
        `node ${__dirname}/../../../../dist/src/index.js ${command}`,
      ].join(' '),
      {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
        cwd: opts?.cwd || this.dir,
      }
    );
  }

  execGitCommand(command: string, opts?: { cwd?: string }): void {
    execSync(`git ${command}`, {
      stdio: process.env.DEBUG ? 'inherit' : 'ignore',
      cwd: opts?.cwd || this.dir,
    });
  }

  execCliCommandAndGetOutput(command: string): string {
    return execSync(
      [
        `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
        `NODE_ENV=development`,
        `node ${__dirname}/../../../../dist/src/index.js ${command}`,
      ].join(' '),
      {
        cwd: this.dir,
      }
    )
      .toString()
      .trim();
  }

  createChange(textValue: string, prefix?: string, unstaged?: boolean): void {
    const filePath = `${this.dir}/${
      prefix ? prefix + '_' : ''
    }${TEXT_FILE_NAME}`;
    fs.writeFileSync(filePath, textValue);
    if (!unstaged) {
      execSync(`git -C "${this.dir}" add ${filePath}`);
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    execSync(`git -C "${this.dir}" add .`);
    execSync(`git -C "${this.dir}" commit -m "${textValue}"`);
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    execSync(`git -C "${this.dir}" add .`);
    execSync(`git -C "${this.dir}" commit --amend --no-edit`);
  }

  deleteBranch(name: string): void {
    execSync(`git -C "${this.dir}" branch -D ${name}`);
  }

  createPrecommitHook(contents: string): void {
    fs.mkdirpSync(`${this.dir}/.git/hooks`);
    fs.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
    execSync(`chmod +x ${this.dir}/.git/hooks/pre-commit`);
  }

  createAndCheckoutBranch(name: string): void {
    execSync(`git -C "${this.dir}" checkout -b "${name}"`, { stdio: 'ignore' });
  }

  checkoutBranch(name: string): void {
    execSync(`git -C "${this.dir}" checkout "${name}"`, { stdio: 'ignore' });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ dir: this.dir });
  }

  resolveMergeConflicts(): void {
    execSync(`git -C "${this.dir}" checkout --theirs .`);
  }

  markMergeConflictsAsResolved(): void {
    execSync(`git -C "${this.dir}" add .`, { stdio: 'ignore' });
  }

  finishInteractiveRebase(opts?: { resolveMergeConflicts?: boolean }): void {
    while (this.rebaseInProgress()) {
      if (opts?.resolveMergeConflicts) {
        this.resolveMergeConflicts();
      }
      this.markMergeConflictsAsResolved();
      execSync(`GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`, {
        stdio: 'ignore',
      });
    }
  }

  currentBranchName(): string {
    return execSync(`git -C "${this.dir}" branch --show-current`)
      .toString()
      .trim();
  }

  getRef(refName: string): string | undefined {
    try {
      return execSync(`git -C "${this.dir}" show-ref -s ${refName}`)
        .toString()
        .trim();
    } catch {
      return undefined;
    }
  }

  listCurrentBranchCommitMessages(): string[] {
    return execSync(`git -C "${this.dir}" log --oneline  --format=%B`)
      .toString()
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    execSync(
      `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
      {
        stdio: 'ignore',
      }
    );
  }

  upsertMeta(name: string, partialMeta: Partial<TMeta>): void {
    const meta = new MetadataRef(name).read({ dir: this.dir }) ?? {};
    MetadataRef.updateOrCreate(
      name,
      { ...meta, ...partialMeta },
      { dir: this.dir }
    );
  }
}
