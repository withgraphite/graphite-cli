import { AbstractDemo } from './abstract_demo';
import { FullDemo } from './full_demo';

const DEMOS: AbstractDemo[] = [new FullDemo()];

async function main(): Promise<void> {
  for (const demo of DEMOS) {
    console.log(`Creating ${demo.name}...`);
    await demo.create();
  }
}

void main();
