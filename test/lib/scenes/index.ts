import { BasicScene } from "./basic_scene";
import { TrailingProdScene } from "./trailing_prod_scene";

const allScenes = [
  ...(process.env.FAST ? [] : [new BasicScene()]),
  new TrailingProdScene(),
];

export { TrailingProdScene, BasicScene, allScenes };
