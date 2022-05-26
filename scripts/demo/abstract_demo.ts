import cp from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';

const OUTPUT_DIR = `${__dirname}/../../demo`;

export abstract class AbstractDemo {
  name: string;
  commands: string[];
  setup: (_dir: string) => void;

  constructor(name: string, commands: string[], setup: (dir: string) => void) {
    this.name = name;
    this.commands = commands;
    this.setup = setup;
  }

  outputFilePath(): string {
    return `${OUTPUT_DIR}/${this.name}.json`;
  }

  outputSvgPath(): string {
    return `${OUTPUT_DIR}/${this.name}.svg`;
  }

  outputGifPath(): string {
    return `${OUTPUT_DIR}/${this.name}.gif`;
  }

  private record(demoDir: string): Promise<void> {
    const remainingCommands = [...this.commands].reverse();
    return new Promise<void>((resolve, reject) => {
      // Start recording.
      if (fs.existsSync(this.outputFilePath())) {
        fs.removeSync(this.outputFilePath());
      }
      const recProcess = cp.spawn(
        '/usr/local/bin/asciinema',
        [
          'rec',
          this.outputFilePath(),
          '--stdin',
          '--overwrite',
          '--command',
          '$SHELL',
        ],
        {
          detached: true,
          cwd: demoDir,
        }
      );

      recProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        console.log(`Closed with non-zero exit code`);
        reject();
        return;
      });

      recProcess.on('error', (err) => {
        console.error('Failed to start subprocess.');
        console.error(err);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
      });

      if (!recProcess) {
        throw new Error('Failed to spawn process');
      }

      if (!recProcess.stdin) {
        throw new Error('No stdin for subprocess');
      }

      recProcess.stdout.on('data', async function (data) {
        if (data.toString().includes('$') || data.toString().includes('➜')) {
          if (remainingCommands.length > 0) {
            writeCommand(recProcess, remainingCommands.pop()!);
          } else {
            // End of tranmission character
            recProcess.stdin.write(`\x04`);
          }
        }
      });

      recProcess.on('', (err) => {
        console.error('Failed to start subprocess.');
        reject(err);
        return;
      });
    });
  }

  public async create(): Promise<void> {
    const tmpDir = tmp.dirSync();
    const demoDir = path.join(tmpDir.name, 'demo');
    fs.mkdirSync(demoDir);

    console.log(`Setting up demo repo`);
    this.setup(demoDir);

    console.log(`Recording`);
    await this.record(demoDir);

    console.log(`Post processing`);
    this.postProcess();

    console.log(`Creating SVG`);
    cp.execSync(
      `svg-term --in ${this.outputFilePath()} --out ${this.outputSvgPath()} --window`
    );

    console.log(`Creating Gif`);
    cp.execSync(
      `GIFSICLE_OPTS="-k 16 -O3" asciicast2gif -t solarized-dark ${this.outputFilePath()} ${this.outputGifPath()}`
    );

    console.log(`Cleaning up`);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  }

  private postProcess(): void {
    const lines = fs
      .readFileSync(this.outputFilePath())
      .toString()
      .trim()
      .split('\n');
    lines.splice(1, 4);
    fs.writeFileSync(this.outputFilePath(), lines.join('\n'));
  }
}

function writeCommand(
  process: cp.ChildProcessWithoutNullStreams,
  command: string
) {
  console.log(`Running command: ${command}`);
  cp.execSync('sleep 3');
  for (const char of command) {
    process.stdin.write(char);
    cp.execSync('sleep 0.01');
  }
  process.stdin.write('\n');
}
