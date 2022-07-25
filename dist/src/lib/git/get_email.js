"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEmail = void 0;
const run_command_1 = require("../utils/run_command");
function getUserEmail() {
    return (0, run_command_1.runGitCommand)({
        args: [`config`, `user.email`],
        onError: 'ignore',
        resource: 'getUserEmail',
    });
}
exports.getUserEmail = getUserEmail;
//# sourceMappingURL=get_email.js.map