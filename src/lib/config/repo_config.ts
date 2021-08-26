import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { ExitFailedError } from "../../lib/errors";
import { gpExecSync } from "../../lib/utils/exec_sync";
import { PreconditionsFailedError } from "../errors";

export const currentGitRepoPrecondition = (): string => {
  const repoRootPath = gpExecSync(
    {
      command: `git rev-parse --git-dir`,
    },
    () => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError("No .git repository found.");
  }
  return repoRootPath;
};

const CONFIG_NAME = ".graphite_repo_config";
const CURRENT_REPO_CONFIG_PATH = path.join(
  currentGitRepoPrecondition(),
  CONFIG_NAME
);

type RepoConfigT = {
  owner?: string;
  name?: string;
  trunk?: string;
  ignoreBranches?: string[];
  // TODO (nicholasyan): clean this up once we've advanced a few versions past
  // v0.8.1.
  logSettings?: {
    maxStacksShownBehindTrunk?: number;
    maxDaysShownBehindTrunk?: number;
  };
  maxStacksShownBehindTrunk?: number;
  maxDaysShownBehindTrunk?: number;
  maxBranchLength?: number;
};

class RepoConfig {
  _data: RepoConfigT;

  constructor(data: RepoConfigT) {
    this._data = data;
  }

  private save(): void {
    fs.writeFileSync(
      CURRENT_REPO_CONFIG_PATH,
      JSON.stringify(this._data, null, 2)
    );
  }

  public getRepoOwner(): string {
    const configOwner = this._data.owner;
    if (configOwner) {
      return configOwner;
    }

    const inferredInfo = inferRepoGitHubInfo();
    if (inferredInfo?.repoOwner) {
      return inferredInfo.repoOwner;
    }

    throw new ExitFailedError(
      "Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner."
    );
  }

  public path(): string {
    return CURRENT_REPO_CONFIG_PATH;
  }

  public setTrunk(trunkName: string): void {
    this._data.trunk = trunkName;
    this.save();
  }

  public getTrunk(): string | undefined {
    return this._data.trunk;
  }

  public setIgnoreBranches(ignoreBranches: string[]): void {
    this._data.ignoreBranches = ignoreBranches;
    this.save();
  }

  public getIgnoreBranches(): string[] {
    return this._data.ignoreBranches || [];
  }

  public setRepoOwner(owner: string): void {
    this._data.owner = owner;
    this.save();
  }

  public getRepoName(): string {
    if (this._data.name) {
      return this._data.name;
    }

    const inferredInfo = inferRepoGitHubInfo();
    if (inferredInfo?.repoName) {
      return inferredInfo.repoName;
    }

    throw new ExitFailedError(
      "Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name."
    );
  }
  public setRepoName(name: string): void {
    this._data.name = name;
    this.save();
  }

  public getMaxDaysShownBehindTrunk(): number {
    this.migrateLogSettings();
    return this._data.maxDaysShownBehindTrunk ?? 30;
  }

  public setMaxDaysShownBehindTrunk(n: number): void {
    this.migrateLogSettings();
    this._data.maxDaysShownBehindTrunk = n;
    this.save();
  }

  public getMaxStacksShownBehindTrunk(): number {
    this.migrateLogSettings();
    return this._data.maxStacksShownBehindTrunk ?? 10;
  }

  public setMaxStacksShownBehindTrunk(n: number): void {
    this.migrateLogSettings();
    this._data.maxStacksShownBehindTrunk = n;
    this.save();
  }

  public branchIsIgnored(branchName: string): boolean {
    return this.getIgnoreBranches().includes(branchName);
  }

  /**
   * These settings used to (briefly) live in logSettings. Moving these to live
   * in the top-level namespace now that they're shared between multiple
   * commands (e.g. log and stacks).
   */
  public migrateLogSettings(): void {
    const maxStacksShownBehindTrunk =
      this._data.logSettings?.maxStacksShownBehindTrunk;
    if (maxStacksShownBehindTrunk !== undefined) {
      this._data.maxStacksShownBehindTrunk = maxStacksShownBehindTrunk;
    }

    const maxDaysShownBehindTrunk =
      this._data.logSettings?.maxDaysShownBehindTrunk;
    if (maxDaysShownBehindTrunk !== undefined) {
      this._data.maxDaysShownBehindTrunk = maxDaysShownBehindTrunk;
    }

    this._data.logSettings = undefined;
    this.save();
  }

  public getMaxBranchLength(): number {
    return this._data.maxBranchLength ?? 50;
  }

  public setMaxBranchLength(numCommits: number) {
    this._data.maxBranchLength = numCommits;
    this.save();
  }
}
function inferRepoGitHubInfo(): {
  repoOwner: string;
  repoName: string;
} {
  // This assumes that the remote to use is named 'origin' and that the remote
  // to fetch from is the same as the remote to push to. If a user runs into
  // an issue where any of these invariants are not true, they can manually
  // edit the repo config file to overrule what our CLI tries to intelligently
  // infer.
  const url = gpExecSync(
    {
      command: `git config --get remote.origin.url`,
    },
    (_) => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();

  const inferError = new ExitFailedError(
    `Failed to infer the owner and name of this repo from remote origin "${url}". Please run \`gt repo owner --set <owner>\` and \`gt repo name --set <name>\` to manually set the repo owner/name. (e.g. in the repo 'screenplaydev/graphite-cli', 'screenplaydev' is the repo owner and 'graphite-cli' is the repo name)`
  );
  if (!url || url.length === 0) {
    throw inferError;
  }

  const { owner, name } = getOwnerAndNameFromURL(url);
  if (owner === undefined || name === undefined) {
    throw inferError;
  }

  return {
    repoOwner: owner,
    repoName: name,
  };
}

function getOwnerAndNameFromURL(originURL: string): {
  owner: string | undefined;
  name: string | undefined;
} {
  let regex = undefined;

  // Most of the time these URLs end with '.git', but sometimes they don't. To
  // keep things clean, when we see it we'll just chop it off.
  let url = originURL;
  if (url.endsWith(".git")) {
    url = url.slice(0, -".git".length);
  }

  if (url.startsWith("git@github.com")) {
    regex = /git@github.com:([^/]+)\/(.+)/;
  } else if (url.startsWith("https://")) {
    regex = /https:\/\/github.com\/([^/]+)\/(.+)/;
  } else {
    return {
      owner: undefined,
      name: undefined,
    };
  }

  // e.g. in screenplaydev/graphite-cli we're trying to get the owner
  // ('screenplaydev') and the repo name ('graphite-cli')
  const matches = regex.exec(url);
  return {
    owner: matches?.[1],
    name: matches?.[2],
  };
}

export function getOwnerAndNameFromURLForTesting(originURL: string): {
  owner: string | undefined;
  name: string | undefined;
} {
  return getOwnerAndNameFromURL(originURL);
}

function readRepoConfig(): RepoConfig {
  if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(
        repoConfigRaw.toString().trim()
      ) as RepoConfigT;
      return new RepoConfig(parsedConfig);
    } catch (e) {
      console.log(
        chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`)
      );
    }
  }
  return new RepoConfig({});
}

const repoConfigSingleton = readRepoConfig();
export default repoConfigSingleton;
