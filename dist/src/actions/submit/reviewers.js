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
exports.getReviewers = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
function getReviewers(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args.fetchReviewers) {
            return undefined;
        }
        const response = yield prompts_1.default({
            type: 'list',
            name: 'reviewers',
            message: 'Reviewers (comma-separated GitHub usernames)',
            seperator: ',',
        }, {
            onCancel: () => {
                throw new errors_1.KilledError();
            },
        });
        return response.reviewers;
    });
}
exports.getReviewers = getReviewers;
//# sourceMappingURL=reviewers.js.map