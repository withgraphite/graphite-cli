import { BasicScene } from './basic_scene';
import { TrailingProdScene } from './trailing_prod_scene';

export const allScenes = [
  ...(process.env.FAST ? [] : [new BasicScene()]),
  new TrailingProdScene(),
];
