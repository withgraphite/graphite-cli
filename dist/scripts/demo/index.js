"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const full_demo_1 = require("./full_demo");
const DEMOS = [new full_demo_1.FullDemo()];
async function main() {
    for (const demo of DEMOS) {
        console.log(`Creating ${demo.name}...`);
        await demo.create();
    }
}
void main();
//# sourceMappingURL=index.js.map