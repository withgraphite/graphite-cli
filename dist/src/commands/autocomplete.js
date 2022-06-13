"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const sorted_branch_names_1 = require("../lib/git/sorted_branch_names");
yargs_1.default.completion('completion', 'Append the output of this command to your shell startup script.', 
//@ts-expect-error types/yargs is out of date with yargs
// eslint-disable-next-line max-params
(current, argv, defaultCompletion, done) => {
    return shouldCompleteBranch(current, argv)
        ? // we don't want to load a full context here, so we'll just use the git call directly
            // once we persist the meta cache to disk, we can consider using a context here
            done(Object.keys((0, sorted_branch_names_1.getBranchNamesAndRevisions)()))
        : defaultCompletion();
});
function shouldCompleteBranch(current, argv) {
    // this handles both with and without --branch because it's the only string arg
    return (((argv['_'].length <= 3 &&
        // gt bco, bdl, btr, but
        // Check membership in argv to ensure that "bco" is its own entry (and not
        // a substring of another command). Since we're dealing with a positional,
        // we also want to make sure that the current argument is the positional
        // (position 3).
        ['bco', 'bdl', 'btr', 'but', 'dpr'].includes('' + argv['_'][1])) ||
        // same as above, but one position further
        (argv['_'].length <= 4 &&
            ['b', 'branch'].includes('' + argv['_'][1]) &&
            [
                'co',
                'checkout',
                'dl',
                'delete',
                'tr',
                'track',
                'ut',
                'untrack',
            ].includes('' + argv['_'][2])) ||
        // gt upstack onto / us onto
        ((argv['_'][1] === 'upstack' || argv['_'][1] === 'us') &&
            argv['_'][2] === 'onto')) &&
        typeof current === 'string');
}
//# sourceMappingURL=autocomplete.js.map