"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPromptResultLine = exports.suggest = void 0;
// eventually we should wrap the whole prompts library in an abstraction
// for now let's move common logic here
const suggest = (input, choices) => choices.filter((c) => c.value.toLocaleLowerCase().includes(input.toLocaleLowerCase()));
exports.suggest = suggest;
const clearPromptResultLine = () => {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
};
exports.clearPromptResultLine = clearPromptResultLine;
//# sourceMappingURL=prompts_helpers.js.map