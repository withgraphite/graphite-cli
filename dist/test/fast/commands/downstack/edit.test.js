"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const perform_in_tmp_dir_1 = require("../../../../src/lib/utils/perform_in_tmp_dir");
const basic_scene_1 = require("../../../lib/scenes/basic_scene");
const utils_1 = require("../../../lib/utils");
function createStackEditsInput(opts) {
    const contents = opts.orderedBranches.map((b) => `pick ${b}`).join('\n');
    const filePath = path_1.default.join(opts.dirPath, 'edits.txt');
    fs_extra_1.default.writeFileSync(filePath, contents);
    return filePath;
}
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): downstack edit`, function () {
        utils_1.configureTest(this, scene);
        it('Can make a no-op downstack edit without conflict or error', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand("branch create 'b' -m '3' -q");
            yield perform_in_tmp_dir_1.performInTmpDir((dirPath) => {
                const inputPath = createStackEditsInput({
                    dirPath,
                    orderedBranches: ['main', 'a', 'b'],
                });
                chai_1.expect(() => scene.repo.execCliCommand(`downstack edit --input "${inputPath}"`)).to.not.throw(Error);
                chai_1.expect(scene.repo.rebaseInProgress()).to.be.false;
            });
        }));
    });
}
//# sourceMappingURL=edit.test.js.map