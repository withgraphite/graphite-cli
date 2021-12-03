"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEmail = void 0;
const child_process_1 = require("child_process");
function getUserEmail() {
    try {
        return child_process_1.execSync("git config user.email").toString().trim();
    }
    catch (err) {
        return undefined;
    }
}
exports.getUserEmail = getUserEmail;
//# sourceMappingURL=context.js.map