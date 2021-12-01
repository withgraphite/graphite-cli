import { expect } from "chai";
import { userConfig } from "../../../../src/lib/config";
import { BasicScene } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of [new BasicScene()]) {
    describe(`(${scene}): auth`, function () {
        configureTest(this, scene);

        /**
         * If users run this test locally, we don't want it to mangle their tips settings
         * As a result, before we run our tests, we save their tips preference
         * and after finishing our tests, we reset their tips preference.
         */
        let tipsPref: boolean | undefined;
        before(function () {
            tipsPref = userConfig.tipsEnabled();
        });

        it("Sanity check - can enable tips", () => {
            expect(() =>
                scene.repo.execCliCommand(`user --enable`)
            ).to.not.throw(Error);
            expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal('tips enabled');
        });

        it("Sanity check - can disable tips", () => {
            expect(() =>
                scene.repo.execCliCommand(`user --disable`)
            ).to.not.throw(Error);
            expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal('tips disabled');
        });

        after(function () {
            if (tipsPref !== undefined) {
                userConfig.toggleTips(tipsPref);
            }
        });
    });
}
