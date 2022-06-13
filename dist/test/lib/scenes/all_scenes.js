"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allScenes = void 0;
const basic_scene_1 = require("./basic_scene");
const trailing_prod_scene_1 = require("./trailing_prod_scene");
exports.allScenes = [
    ...(process.env.FAST ? [] : [new basic_scene_1.BasicScene()]),
    new trailing_prod_scene_1.TrailingProdScene(),
];
//# sourceMappingURL=all_scenes.js.map