import fs from 'fs-extra';
import path from 'path';
import { USER_CONFIG_OVERRIDE_ENV } from '../context';
import { rebaseInProgress } from '../git/rebase_in_progress';
import { runCommand, runCommandAndSplitLines } from './run_command';

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
      runCommand({
        command: `git`,
        args: [`clone`, opts.repoUrl, dir],
        onError: 'throw',
      });
    } else {
      runCommand({
        command: `git`,
        args: [`init`, dir, `-b`, `main`],
        onError: 'throw',
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
    runCommand({
      command: `git`,
      args,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: opts?.cwd || this.dir,
      },
      onError: 'ignore',
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
      runCommand({
        command: `git`,
        args: [`add`, filePath],
        options: { cwd: this.dir },
        onError: 'throw',
      });
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    runCommand({
      command: `git`,
      args: [`add`, `.`],
      options: { cwd: this.dir },
      onError: 'throw',
    });
    runCommand({
      command: `git`,
      args: [`commit`, `-m`, textValue],
      options: { cwd: this.dir },
      onError: 'throw',
    });
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    runCommand({
      command: `git`,
      args: [`add`, `.`],
      options: { cwd: this.dir },
      onError: 'throw',
    });
    runCommand({
      command: `git`,
      args: [`commit`, `--amend`, `--no-edit`],
      options: { cwd: this.dir },
      onError: 'throw',
    });
  }

  deleteBranch(name: string): void {
    runCommand({
      command: `git`,
      args: [`branch`, `-D`, name],
      options: { cwd: this.dir },
      onError: 'throw',
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
    runCommand({
      command: `git`,
      args: [`checkout`, `-b`, name],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
    });
  }

  checkoutBranch(name: string): void {
    runCommand({
      command: `git`,
      args: [`checkout`, name],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
    });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ cwd: this.dir });
  }

  resolveMergeConflicts(): void {
    runCommand({
      command: `git`,
      args: [`checkout`, `--theirs`, `.`],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
    });
  }

  markMergeConflictsAsResolved(): void {
    runCommand({
      command: `git`,
      args: [`add`, `.`],
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
        cwd: this.dir,
      },
      onError: 'throw',
    });
  }

  currentBranchName(): string {
    return runCommand({
      command: `git`,
      args: [`branch`, `--show-current`],
      options: { cwd: this.dir },
      onError: 'ignore',
    });
  }

  getRef(refName: string): string {
    return runCommand({
      command: `git`,
      args: [`show-ref`, `-s`, refName],
      options: { cwd: this.dir },
      onError: 'ignore',
    });
  }

  listCurrentBranchCommitMessages(): string[] {
    return runCommandAndSplitLines({
      command: `git`,
      args: [`log`, `--oneline`, `--format=%B`],
      options: { cwd: this.dir },
      onError: 'ignore',
    });
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    this.checkoutBranch(args.branch);
    runCommand({
      command: `git`,
      args: [`merge`, args.mergeIn],
      options: {
        cwd: this.dir,
        stdio: process.env.DEBUG ? 'inherit' : 'pipe',
      },
      onError: 'throw',
    });
  }
}
