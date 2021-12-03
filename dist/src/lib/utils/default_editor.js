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
exports.getDefaultEditorOrPrompt = void 0;
const exec_sync_1 = require("./exec_sync");
const splog_1 = require("./splog");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../errors");
const config_1 = require("../../lib/config");
const editor_1 = require("../../commands/user-commands/editor");
/*
If the editor is not set, we attempt to infer it from environment variables $GIT_EDITOR or $EDITOR.
If those are unavailable, we want to prompt user to set them. If user doesn't want to set them, we default to nano.
 */
function getDefaultEditorOrPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        yield setDefaultEditorOrPrompt();
        return config_1.userConfig.getEditor() || editor_1.DEFAULT_GRAPHITE_EDITOR;
    });
}
exports.getDefaultEditorOrPrompt = getDefaultEditorOrPrompt;
function setDefaultEditorOrPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.userConfig.getEditor()) {
            // Check if any env variable is set.
            const systemEditor = exec_sync_1.gpExecSync({ command: `echo \${GIT_EDITOR:-$EDITOR}` })
                .toString()
                .trim();
            let editorPref;
            if (systemEditor.length) {
                editorPref = systemEditor;
                splog_1.logTip(`Graphite will now use ${editorPref} as the default editor setting. 
      We infer it from your environment variables ($GIT_EDITOR || $EDITOR). 
      If you wish to change it, use \`gt user editor\` to change this in the future`);
            }
            else {
                splog_1.logInfo(chalk_1.default.yellow(`We did not detect an editor preference in your settings. Do you wish to set it? (Graphite will use ${editor_1.DEFAULT_GRAPHITE_EDITOR} as default.)`));
                const yesOrNo = yield prompts_1.default({
                    type: "select",
                    name: "editorPrompt",
                    message: "Set default editor now?",
                    choices: [
                        { title: `Yes`, value: "yes" },
                        {
                            title: `Skip and use Graphite default (${editor_1.DEFAULT_GRAPHITE_EDITOR})`,
                            value: "no", // Should find a way to remember this selection so we are not repeatedly prompting
                        },
                    ],
                }, {
                    onCancel: () => {
                        throw new errors_1.KilledError();
                    },
                });
                if (yesOrNo.editorPrompt === "yes") {
                    const response = yield prompts_1.default({
                        type: "select",
                        name: "editor",
                        message: "Select an editor:",
                        choices: [
                            { title: `vim`, value: "vim" },
                            { title: `emacs`, value: "emacs" },
                            { title: `nano`, value: "nano" },
                        ],
                    }, {
                        onCancel: () => {
                            throw new errors_1.KilledError();
                        },
                    });
                    editorPref = response.editor;
                }
                else {
                    editorPref = editor_1.DEFAULT_GRAPHITE_EDITOR;
                }
            }
            config_1.userConfig.setEditor(editorPref);
            splog_1.logInfo(chalk_1.default.yellow(`Graphite editor preference set to ${editorPref}.`));
        }
    });
}
//# sourceMappingURL=default_editor.js.map