import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';

// Move to cal-versioning as we start automating CLI releases
// 2012-11-04T14:51:06.157Z -> 12.11.04145106
const version: string = new Date()
  .toISOString()
  .replace(/\..+/, '')
  .replace('T', '')
  .replace(/:/g, '')
  .replace(/-/g, '.')
  .slice(2);

const VERSION_TAG = `v${version}`;

function hasGitChanges(): boolean {
  return execSync(`git status --porcelain`).toString().trim().length !== 0;
}

function pushDirToRepo(opts: {
  absoluteDirPath: string;
  repo: string;
  tmpMutation: (dirPath: string) => void;
  clearExisting: boolean;
  repoName: string;
}) {
  const tmpDir = tmp.dirSync();
  process.chdir(tmpDir.name);
  execSync(`git clone ${opts.repo}`, { stdio: 'inherit' });
  console.log(`cloned into ${tmpDir.name}`);
  const clonedRepoPath = path.join(tmpDir.name, opts.repoName);
  process.chdir(clonedRepoPath);
  if (opts.clearExisting) {
    console.log(`clearing from ${process.cwd()}`);
    execSync(
      `find .  -mindepth 1 -maxdepth 1 ! -regex './.git' -exec rm -rf "{}" \\;`,
      {
        stdio: 'inherit',
      }
    ); // delete everything but the open source git folder
  }
  console.log(`copying from ${opts.absoluteDirPath} to ${clonedRepoPath}`);
  fs.copySync(opts.absoluteDirPath, clonedRepoPath); // copy over the monorepo version of the cli.
  opts.tmpMutation(clonedRepoPath);
  execSync(`git add -f .`, { stdio: 'inherit' }); // Include the dist which is normally ignored.
  execSync(`git commit -m "${VERSION_TAG}" --no-verify`, { stdio: 'inherit' });
  execSync(`git push origin`, { stdio: 'inherit' });
  execSync(`git tag -a ${VERSION_TAG} -m "${VERSION_TAG}"`, {
    stdio: 'inherit',
  });
  execSync(`git push origin ${VERSION_TAG}`, { stdio: 'inherit' });

  console.log(
    `New commit successfully created and pushed to ${opts.repo}. Remember to bump the homebrew tap to include ${VERSION_TAG}!.`
  );

  // Cleanup
  fs.rmdirSync(tmpDir.name);
  tmpDir.removeCallback();
}

function deploy() {
  if (process.env.NEVER) {
    if (hasGitChanges()) {
      throw new Error(
        `Please make sure there are no uncommitted changes before deploying`
      );
    }
  }

  pushDirToRepo({
    absoluteDirPath: path.join(__dirname, '../../../'),
    repo: 'git@github.com:screenplaydev/graphite-cli.git',
    clearExisting: true,
    repoName: 'graphite-cli',
    tmpMutation: (dirPath: string) => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dirPath, `package.json`)).toString()
      );
      pkg['version'] = version;
      fs.writeFileSync(
        path.join(dirPath, './package.json'),
        JSON.stringify(pkg, null, 2)
      );
      fs.writeFileSync(
        path.join(dirPath, './dist/package.json'),
        JSON.stringify(pkg, null, 2)
      );
    },
  });

  // Now bump the homebrew-tap
  pushDirToRepo({
    absoluteDirPath: path.join(__dirname, '../../../homebrew-tap/'),
    repo: 'https://github.com/screenplaydev/homebrew-tap.git',
    clearExisting: false, // Dont blow away rendered formulas that we're not currently bumping.
    repoName: 'homebrew-tap',
    tmpMutation: () => {
      execSync(`yarn install`);
      execSync(`yarn update-graphite-cli-version ${version} --no-stable`);
    },
  });
}

deploy();
