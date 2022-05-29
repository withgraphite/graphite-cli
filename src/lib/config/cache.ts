import { Branch } from '../../wrapper-classes/branch';
let metaChildren: Record<string, Branch[]> | undefined = undefined;

class Cache {
  public getMetaChildren(): Record<string, Branch[]> | undefined {
    return metaChildren;
  }

  clearAll(): void {
    metaChildren = undefined;
  }

  setMetaChildren(newMetaChildren: Record<string, Branch[]>): void {
    metaChildren = newMetaChildren;
  }
}

export const cache = new Cache();
