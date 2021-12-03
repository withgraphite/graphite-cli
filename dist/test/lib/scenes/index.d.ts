import { BasicScene } from "./basic_scene";
import { PublicRepoScene } from "./public_repo_scene";
import { TrailingProdScene } from "./trailing_prod_scene";
declare const allScenes: (BasicScene | TrailingProdScene)[];
export { TrailingProdScene, BasicScene, allScenes, PublicRepoScene };
