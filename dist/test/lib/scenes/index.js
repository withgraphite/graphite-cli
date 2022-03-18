"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicRepoScene = exports.allScenes = exports.BasicScene = exports.TrailingProdScene = void 0;
const basic_scene_1 = require("./basic_scene");
Object.defineProperty(exports, "BasicScene", { enumerable: true, get: function () { return basic_scene_1.BasicScene; } });
const public_repo_scene_1 = require("./public_repo_scene");
Object.defineProperty(exports, "PublicRepoScene", { enumerable: true, get: function () { return public_repo_scene_1.PublicRepoScene; } });
const trailing_prod_scene_1 = require("./trailing_prod_scene");
Object.defineProperty(exports, "TrailingProdScene", { enumerable: true, get: function () { return trailing_prod_scene_1.TrailingProdScene; } });
const allScenes = [
    ...(process.env.FAST ? [] : [new basic_scene_1.BasicScene()]),
    new trailing_prod_scene_1.TrailingProdScene(),
];
exports.allScenes = allScenes;
//# sourceMappingURL=index.js.map