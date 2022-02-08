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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStackEdits = exports.editDownstack = void 0;
const pending_stack_edits_config_1 = require("../../lib/config/pending_stack_edits_config");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const utils_1 = require("../../lib/utils");
const default_editor_1 = require("../../lib/utils/default_editor");
const perform_in_tmp_dir_1 = require("../../lib/utils/perform_in_tmp_dir");
const wrapper_classes_1 = require("../../wrapper-classes");
const validate_1 = require("../validate");
const apply_stack_edit_pick_1 = require("./apply_stack_edit_pick");
const create_stack_edit_file_1 = require("./create_stack_edit_file");
const parse_stack_edit_file_1 = require("./parse_stack_edit_file");
function editDownstack(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // We're about to do some complex re-arrangements - ensure state is consistant before beginning.
        yield validate_1.validate('DOWNSTACK');
        const currentBranch = preconditions_1.currentBranchPrecondition();
        const stack = new wrapper_classes_1.MetaStackBuilder().downstackFromBranch(currentBranch);
        const stackEdits = (opts === null || opts === void 0 ? void 0 : opts.inputPath)
            ? parse_stack_edit_file_1.parseEditFile({ filePath: opts.inputPath }) // allow users to pass a pre-written file, mostly for unit tests.
            : yield promptForEdit(stack);
        yield applyStackEdits(stackEdits);
    });
}
exports.editDownstack = editDownstack;
function applyStackEdits(stackEdits) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < stackEdits.length; i++) {
            pending_stack_edits_config_1.savePendingStackEdits(stackEdits.slice(i)); // Write the remaining edits in case this one gets interupted.
            yield processStackEdit(stackEdits[i]);
        }
        // Cleanup any pending files.
        pending_stack_edits_config_1.clearPendingStackEdits();
    });
}
exports.applyStackEdits = applyStackEdits;
function processStackEdit(stackEdit) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (stackEdit.type) {
            case 'pick':
                yield apply_stack_edit_pick_1.applyStackEditPick(stackEdit);
        }
    });
}
function promptForEdit(stack) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultEditor = yield default_editor_1.getDefaultEditorOrPrompt();
        return yield perform_in_tmp_dir_1.performInTmpDir((tmpDir) => __awaiter(this, void 0, void 0, function* () {
            const editFilePath = create_stack_edit_file_1.createStackEditFile({ stack, tmpDir });
            yield utils_1.gpExecSync({
                command: `${defaultEditor} "${editFilePath}"`,
                options: { stdio: 'inherit' },
            }, (err) => {
                throw new errors_1.ExitFailedError('Failed to prompt for stack edit. Aborting...', err);
            });
            return parse_stack_edit_file_1.parseEditFile({ filePath: editFilePath });
        }));
    });
}
//# sourceMappingURL=edit_downstack.js.map