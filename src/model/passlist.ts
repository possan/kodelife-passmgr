import { PassInfo } from "../types/editor";

export class PassList {
  passes: PassInfo[] = [];

  constructor(input: PassInfo[] | undefined) {
    this.passes = input ?? [];
  }

  replaceAll(all: PassInfo[]) {
    this.passes = all;
  }

  add(pass: PassInfo) {
    this.passes.push(pass);
  }

  getIds(): string[] {
    return this.passes.map((p) => p.id);
  }

  get(index: number): PassInfo | undefined {
    return this.passes[index];
  }

  swap(index1: number, index2: number) {
    const t0 = this.passes[index1];
    this.passes[index1] = this.passes[index2];
    this.passes[index2] = t0;
  }

  size(): number {
    return this.passes.length;
  }

  clear() {
    this.passes = [];
  }

  move(oldindex: number, newindex: number) {
    const olditem = this.get(oldindex);

    console.log("moving item index", oldindex, newindex, olditem);

    if (!olditem) {
      return;
    }

    if (oldindex === newindex) {
      return;
    }

    if (oldindex > newindex) {
      // remove first
      this.removeAt(oldindex);
      // insert after
      this.insertAt(newindex, olditem);
    } else if (newindex > oldindex) {
      // insert first
      this.insertAt(newindex, olditem);
      // remove after
      this.removeAt(oldindex);
    }
  }

  removeAt(index: number) {
    this.passes.splice(index, 1);
    console.log("removed item", index, this.passes);
  }

  removeById(id: string) {
    this.passes = this.passes.filter((p) => p.id !== id);
  }

  insertAt(index: number, pass: PassInfo) {
    if (index === this.passes.length) {
      this.passes.push(pass);
    } else {
      this.passes.splice(index, 0, pass);
    }
    console.log("inserted item", index, pass, this.passes);
  }
}
