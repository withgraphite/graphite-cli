"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config_1 = require("../../../../src/lib/config");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
const utils_2 = require("../../../../src/lib/utils");
const editor_1 = require("../../../../src/commands/user-commands/editor");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): user editor`, function () {
        utils_1.configureTest(this, scene);
        /**
         * If users run this test locally, we don't want it to mangle their editor settings
         * As a result, before we run our tests, we save their editor preference
         * and after finishing our tests, we reset their editor preference.
         */
        let editorPref;
        before(function () {
            editorPref = config_1.userConfig.getEditor();
            utils_2.logInfo(`Existing user pref: ${editorPref}`);
        });
        it("Sanity check - can check editor", () => {
            scene.repo.execCliCommand(`user editor --unset`);
            chai_1.expect(() => scene.repo.execCliCommand(`user editor`)).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal('Current editor preference is set to : nano');
        });
        it("Sanity check - can set editor", () => {
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user editor --set vim`)).to.equal('Editor preference set to: vim');
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal('Current editor preference is set to : vim');
        });
        it("Sanity check - can unset editor", () => {
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user editor --unset`)).to.equal(`Editor preference erased. Defaulting to Graphite default: ${editor_1.DEFAULT_GRAPHITE_EDITOR}`);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal(`Current editor preference is set to : ${editor_1.DEFAULT_GRAPHITE_EDITOR}`);
        });
        after(function () {
            if (editorPref !== undefined) {
                config_1.userConfig.setEditor(editorPref);
                utils_2.logInfo(`Reset user pref: ${editorPref}`);
            }
        });
    });
}
//# sourceMappingURL=editor.test.js.map