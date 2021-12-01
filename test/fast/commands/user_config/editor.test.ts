import { expect } from "chai";
import { userConfig } from "../../../../src/lib/config";
import { BasicScene } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of [new BasicScene()]) {
    describe(`(${scene}): auth`, function () {
        configureTest(this, scene);

        /**
         * If users run this test locally, we don't want it to mangle their editor settings
         * As a result, before we run our tests, we save their editor preference
         * and after finishing our tests, we reset their editor preference.
         */
        let editorPref: string | undefined;
        before(function () {
            editorPref = userConfig.getEditor();
        });

        it("Sanity check - can check editor", () => {
            scene.repo.execCliCommand(`user editor --unset`);
            expect(() =>
                scene.repo.execCliCommand(`user editor`)
            ).to.not.throw(Error);
            expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal('Current editor preference is set to : nano');
        });

        it("Sanity check - can set editor", () => {
            expect(() =>
                scene.repo.execCliCommand(`user editor --set vim`)
            ).to.not.throw(Error);
            expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal('Current editor preference is set to : vim');
        });

        it("Sanity check - can unset editor", () => {
            expect(() =>
                scene.repo.execCliCommand(`user editor --unset`)
            ).to.not.throw(Error);
            expect(scene.repo.execCliCommandAndGetOutput(`user editor`))
                .to
                .equal('Current editor preference is set to : nano');
        });

        after(function () {
            if (editorPref !== undefined) {
                userConfig.setEditor(editorPref);
            }
        });
    });
}
