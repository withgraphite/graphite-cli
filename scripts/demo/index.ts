import AbstractDemo from "./abstract_demo";
import DiffDemo from "./diff_demo";
import FullDemo from "./full_demo";
import RestackDemo from "./restack_demo";

const DEMOS: AbstractDemo[] = [
  new DiffDemo(),
  new RestackDemo(),
  new FullDemo(),
];

async function main(): Promise<void> {
  for (const demo of DEMOS) {
    console.log(`Creating ${demo.name}...`);
    await demo.create();
  }
}

void main();
