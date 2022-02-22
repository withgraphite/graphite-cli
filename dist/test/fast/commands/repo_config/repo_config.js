"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config_1 = require("../../../../src/lib/config");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): infer repo owner/name`, function () {
        utils_1.configureTest(this, scene);
        it('Can infer cloned repos', () => {
            const { owner, name } = config_1.getOwnerAndNameFromURLForTesting('https://github.com/screenplaydev/graphite-cli.git');
            chai_1.expect(owner === 'screenplaydev').to.be.true;
            chai_1.expect(name === 'graphite-cli').to.be.true;
        });
        it('Can infer SSH cloned repos', () => {
            const { owner, name } = config_1.getOwnerAndNameFromURLForTesting('git@github.com:screenplaydev/graphite-cli.git');
            chai_1.expect(owner === 'screenplaydev').to.be.true;
            chai_1.expect(name === 'graphite-cli').to.be.true;
        });
        // Not sure where these are coming from but we should be able to handle
        // them.
        it('Can infer cloned repos without .git', () => {
            const clone = config_1.getOwnerAndNameFromURLForTesting('https://github.com/screenplaydev/graphite-cli');
            chai_1.expect(clone.owner === 'screenplaydev').to.be.true;
            chai_1.expect(clone.name === 'graphite-cli').to.be.true;
            let sshClone = config_1.getOwnerAndNameFromURLForTesting('git@github.com:screenplaydev/graphite-cli');
            chai_1.expect(sshClone.owner === 'screenplaydev').to.be.true;
            chai_1.expect(sshClone.name === 'graphite-cli').to.be.true;
        });
    });
}
//# sourceMappingURL=repo_config.js.map