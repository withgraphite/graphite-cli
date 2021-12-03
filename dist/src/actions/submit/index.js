"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAction = exports.inferPRTitle = exports.inferPRBody = exports.submitBranches = void 0;
const pr_body_1 = require("./pr_body");
Object.defineProperty(exports, "inferPRBody", { enumerable: true, get: function () { return pr_body_1.inferPRBody; } });
const pr_title_1 = require("./pr_title");
Object.defineProperty(exports, "inferPRTitle", { enumerable: true, get: function () { return pr_title_1.inferPRTitle; } });
const submit_1 = require("./submit");
Object.defineProperty(exports, "submitAction", { enumerable: true, get: function () { return submit_1.submitAction; } });
Object.defineProperty(exports, "submitBranches", { enumerable: true, get: function () { return submit_1.submitBranches; } });
//# sourceMappingURL=index.js.map