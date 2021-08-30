import fs from "fs-extra";
import path from "path";
import { ExitFailedError } from "../lib/errors";
import { getRepoRootPath } from "../lib/utils";

export default class MetadataRef {
  _branchName: string;
  _path: string;

  constructor(branchName: string) {
    this._branchName = branchName;
    this._path = path.join(
      getRepoRootPath(),
      `refs/branch-metadata/`,
      branchName
    );
  }

  public rename(newBranchName: string): void {
    if (!fs.existsSync(this._path)) {
      throw new ExitFailedError(
        `No Graphite metadata ref found at ${this._path}`
      );
    }
    fs.moveSync(
      path.join(this._path),
      path.join(path.dirname(this._path), newBranchName)
    );
    this._branchName = newBranchName;
  }
}
