"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeId = void 0;
function makeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeId = makeId;
//# sourceMappingURL=make_id.js.map