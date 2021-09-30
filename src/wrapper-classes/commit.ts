import { execSync } from "child_process";
import { gpExecSync } from "../lib/utils";

export default class Commit {
  sha: string;

  constructor(sha: string) {
    if (sha.length != 40) {
      throw new Error(
        `Commit sha must be 40 characters long. Attempted sha = "${sha}"`
      );
    }
    this.sha = sha;
  }

  public parents(): Commit[] {
    try {
      return execSync(`git rev-parse ${this.sha}`)
        .toString()
        .trim()
        .split("\n")
        .map((parentSha) => new Commit(parentSha));
    } catch (e) {
      return [];
    }
  }

  private messageImpl(format: "B" | "b" | "s"): string {
    const message = gpExecSync(
      {
        command: `git log --format=%${format} -n 1 ${this.sha}`,
      },
      (_) => {
        // just soft-fail if we can't find the commits
        return Buffer.alloc(0);
      }
    )
      .toString()
      .trim();
    return message;
  }

  public messageRaw(): string {
    return this.messageImpl("B");
  }

  public messageSubject(): string {
    return this.messageImpl("s");
  }

  public messageBody(): string {
    return this.messageImpl("b");
  }
}
