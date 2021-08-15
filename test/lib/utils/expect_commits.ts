import { expect } from "chai";
import { GitRepo } from "../../../src/lib/utils";
export function expectCommits(repo: GitRepo, commitMessages: string): void {
  expect(
    repo
      .listCurrentBranchCommitMessages()
      .slice(0, commitMessages.split(",").length)
      .join(", ")
  ).to.equal(commitMessages);
}
