import cp from 'child_process';

// Spawns an async process that executes the specified file
export function spawnDetached(filename: string, args: string[] = []): void {
  cp.spawn('node', [filename, ...args], {
    detached: true,
    stdio: 'ignore',
  }).unref();
}
