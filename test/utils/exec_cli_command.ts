import { execSync } from "child_process";
export function execCliCommand(
  command: string,
  opts: { fromDir: string }
): void {
  execSync(
    `NODE_ENV=development node ${__dirname}/../../dist/src/index.js ${command}`,
    {
      stdio: "ignore",
      cwd: opts.fromDir,
    }
  );
}
