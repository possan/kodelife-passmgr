import { Pass, PassInfo } from "../types/editor";
import { KLProject } from "./unpacked";

export class PassRepository {
  _passes: Record<string, Pass> = {};

  constructor() {
    this._passes = {};
  }

  getPass(id: string): Pass | undefined {
    return this._passes[id];
  }

  getAllPassesFromProject(project: KLProject) {
    const list = project.getPassOrder();
    console.log("got pass ids", list);
    for (const id of list) {
      const pass = project.getPass(id);
      console.log("got pass", pass);
      if (pass) {
        this._passes[id] = pass;
      }
    }
  }

  getPassInfo(id: string): PassInfo | undefined {
    return this._passes[id]?.passInfo;
  }

  getPassInfoList(ids: string[]): PassInfo[] {
    let ret: PassInfo[] = [];
    ids.forEach((id) => {
      const passinfo = this.getPassInfo(id);
      if (passinfo) {
        ret.push(passinfo);
      }
    });
    return ret;
  }

  setPass(id: string, pass: Pass) {
    this._passes[id] = pass;
  }

  stats() {
    console.log("PassRepo stats", this._passes.length, this._passes);
  }
}
