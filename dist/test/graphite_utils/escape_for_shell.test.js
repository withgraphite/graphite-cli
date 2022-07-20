"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const escape_for_shell_1 = require("../../src/lib/utils/escape_for_shell");
describe('shell escaping', function () {
    for (const s of [
        'HELLO',
        'Hello, world!',
        "'''\"\"\"'''",
        '\\/|$*&(*&^#$',
        [...Array(256).keys()]
            .slice(32)
            .map((n) => String.fromCharCode(n))
            .join(''),
    ]) {
        it('outputs its input when passed through echo', async () => {
            (0, chai_1.expect)((0, child_process_1.execSync)(`echo ${(0, escape_for_shell_1.q)(s)}`, { encoding: 'utf-8' })).to.equal(`${s}\n`);
        });
    }
});
//# sourceMappingURL=escape_for_shell.test.js.map