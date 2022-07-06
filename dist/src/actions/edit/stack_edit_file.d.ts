import { TContext } from '../../lib/context';
export declare function createStackEditFile(opts: {
    branchNames: string[];
    tmpDir: string;
}, context: TContext): string;
export declare function parseEditFile(filePath: string): string[];
