"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line import/no-unresolved
const validators_1 = __importDefault(require("./validators"));
exports.default = (schemaId, config) => {
    const validate = validators_1.default[schemaId];
    if (!validate(config)) {
        const errors = validate.errors.map((error) => {
            return {
                message: error.message,
                params: error.params,
                schemaPath: error.schemaPath,
            };
        });
        /* eslint-disable no-console */
        console.log('config', config);
        console.log('errors', errors);
        /* eslint-enable no-console */
        throw new Error('Invalid config.');
    }
};
//# sourceMappingURL=validateConfig.js.map