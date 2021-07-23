import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import Branch from "../../src/wrapper-classes/branch";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("Branch tests", function () {
  it("Can list git parent for a branch", () => {
    const tmpDir = tmp.dirSync();
    const repo = new GitRepo(tmpDir.name);
    const oldDir = __dirname;
    process.chdir(tmpDir.name);

    repo.createChangeAndCommit("1");
    repo.createChange("2");

    execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });

    const branch = new Branch("a");
    expect(branch.getParentsFromGit()[0].name).to.equal("main");

    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  it("Can list parent based on meta for a branch", () => {
    const tmpDir = tmp.dirSync();
    const repo = new GitRepo(tmpDir.name);
    const oldDir = __dirname;
    process.chdir(tmpDir.name);

    repo.createChangeAndCommit("1");
    repo.createChange("2");

    execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });

    const branch = new Branch("a");
    expect(branch.getParentFromMeta()).is.not.undefined;
    expect(branch.getParentFromMeta()!.name).to.equal("main");

    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
});
