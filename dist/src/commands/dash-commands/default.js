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
exports.handler = exports.canonical = exports.builder = exports.description = exports.command = void 0;
const open_1 = __importDefault(require("open"));
const profile_1 = require("../../lib/telemetry/profile");
const args = {};
exports.command = '*';
exports.description = 'Opens your Graphite dashboard in the web.';
exports.builder = args;
exports.canonical = 'dash';
const DASHBOARD_URL = 'https://app.graphite.dev/';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, () => __awaiter(void 0, void 0, void 0, function* () {
        void open_1.default(DASHBOARD_URL);
    }));
});
exports.handler = handler;
//# sourceMappingURL=default.js.map