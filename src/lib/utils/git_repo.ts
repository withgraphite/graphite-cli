import fs from 'fs-extra';
import path from 'path';
import { USER_CONFIG_OVERRIDE_ENV } from '../context';
import { rebaseInProgress } from '../git/rebase_in_progress';
import {
  runCommand,
  runGitCommand,
  runGitCommandAndSplitLines,
} from './run_command';

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
      runGitCommand({
        args: [`clone`, opts.repoUrl, dir],
        onError: 'throw',
        resource: null,
      });
    } else {
      runGitCommand({
        args: [`init`, dir, `-b`, `main`],
        onError: 'throw',
        resource: null,
      });
    }
  }

  runCliCommand(command: string[], opts?: { cwd?: string }): void {
    runCommand({
      command: process.argv[0],
      args: [
        path.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
        ...command,
      ],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: opts?.cwd || this.dir,
        env: {
          ...process.env,
          [USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
          GRAPHITE_DISABLE_TELEMETRY: '1',
          GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
        },
      },
      onError: 'throw',
    });
  }

  runGitCommand(args: string[], opts?: { cwd?: string }): void {
    runGitCommand({
      args,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: opts?.cwd || this.dir,
      },
      onError: 'ignore',
      resource: null,
    });
  }

  runCliCommandAndGetOutput(args: string[]): string {
    return runCommand({
      command: process.argv[0],
      args: [
        path.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
        ...args,
      ],
      options: {
        cwd: this.dir,
        env: {
          ...process.env,
          [USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
          GRAPHITE_DISABLE_TELEMETRY: '1',
          GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
        },
      },
      onError: 'ignore',
    });
  }

  createChange(textValue: string, prefix?: string, unstaged?: boolean): void {
    const filePath = path.join(
      `${this.dir}`,
      `${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`
    );
    fs.writeFileSync(filePath, textValue);
    if (!unstaged) {
      runGitCommand({
        args: [`add`, filePath],
        options: { cwd: this.dir },
        onError: 'throw',
        resource: null,
      });
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    runGitCommand({
      args: [`add`, `.`],
      options: { cwd: this.dir },
      onError: 'throw',
      resource: null,
    });
    runGitCommand({
      args: [`commit`, `-m`, textValue],
      options: { cwd: this.dir },
      onError: 'throw',
      resource: null,
    });
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    runGitCommand({
      args: [`add`, `.`],
      options: { cwd: this.dir },
      onError: 'throw',
      resource: null,
    });
    runGitCommand({
      args: [`commit`, `--amend`, `--no-edit`],
      options: { cwd: this.dir },
      onError: 'throw',
      resource: null,
    });
  }

  deleteBranch(name: string): void {
    runGitCommand({
      args: [`branch`, `-D`, name],
      options: { cwd: this.dir },
      onError: 'throw',
      resource: null,
    });
  }

  createPrecommitHook(contents: string): void {
    fs.mkdirpSync(`${this.dir}/.git/hooks`);
    fs.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
    runCommand({
      command: `chmod`,
      args: [`+x`, `${this.dir}/.git/hooks/pre-commit`],
      options: { cwd: this.dir },
      onError: 'throw',
    });
  }

  createAndCheckoutBranch(name: string): void {
    runGitCommand({
      args: [`checkout`, `-b`, name],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
      resource: null,
    });
  }

  checkoutBranch(name: string): void {
    runGitCommand({
      args: [`checkout`, name],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
      resource: null,
    });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ cwd: this.dir });
  }

  resolveMergeConflicts(): void {
    runGitCommand({
      args: [`checkout`, `--theirs`, `.`],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
      resource: null,
    });
  }

  markMergeConflictsAsResolved(): void {
    runGitCommand({
      args: [`add`, `.`],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
      resource: null,
    });
  }

  currentBranchName(): string {
    return runGitCommand({
      args: [`branch`, `--show-current`],
      options: { cwd: this.dir },
      onError: 'ignore',
      resource: null,
    });
  }

  getRef(refName: string): string {
    return runGitCommand({
      args: [`show-ref`, `-s`, refName],
      options: { cwd: this.dir },
      onError: 'ignore',
      resource: null,
    });
  }

  listCurrentBranchCommitMessages(): string[] {
    return runGitCommandAndSplitLines({
      args: [`log`, `--oneline`, `--format=%B`],
      options: { cwd: this.dir },
      onError: 'ignore',
      resource: null,
    });
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    this.checkoutBranch(args.branch);
    runGitCommand({
      args: [`merge`, args.mergeIn],
      options: {
        cwd: this.dir,
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
      },
      onError: 'throw',
      resource: null,
    });
  }
}
