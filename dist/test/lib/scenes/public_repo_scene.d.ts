import { AbstractScene } from "./abstract_scene";
export declare class PublicRepoScene extends AbstractScene {
    repoUrl: string;
    name: string;
    timeout: number;
    constructor(opts: {
        repoUrl: string;
        name: string;
        timeout: number;
    });
    toString(): string;
    setup(): void;
}
