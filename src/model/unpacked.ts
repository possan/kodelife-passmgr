import * as uuid from "uuid";
import { Pass, PassInfo } from "../types/editor";
import { PassRepository } from "./passrepo";

export class KLProject {
  _xml: string | undefined;
  doc: XMLDocument;
  filename: string | undefined;

  constructor() {
    this._xml = undefined;
    this.filename = undefined;
  }

  setXML(xml: string, filename: string) {
    this._xml = xml;
    this.filename = filename;

    const parser = new DOMParser();
    this.doc = parser.parseFromString(this._xml, "application/xml");

    // assign unique id's to each pass
    const passes = this.doc.querySelectorAll("passes pass");
    Array.from(passes).forEach((pass) => {
      pass.setAttribute("editor-id", uuid.v4());
    });

    console.log("doc", this.doc);
  }

  async getXML(): Promise<string> {
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(this.doc);
    return xmlStr;
  }

  getPasses(): PassInfo[] {
    console.log("getpasses", this.doc);

    const list = this.doc.querySelectorAll("passes pass");
    console.log("list", list);

    return Array.from(list).map((pass) => {
      const id = pass.getAttribute("editor-id");
      const label = pass.querySelector("properties label");

      if (id && label) {
        return {
          id: id ?? "",
          label: label.textContent,
        } as PassInfo;
      }

      return {
        id: "",
        label: "?",
      } as PassInfo;
    });
  }

  swapPasses(passid1: string, passid2: string) {
    if (passid1 === passid2) {
      return;
    }

    console.log("swap passes", passid1, passid2);

    const passMap: Record<string, Element> = {};

    const oldPasses: Element[] = [];
    const oldPassOrder: string[] = [];
    const list = this.doc.querySelectorAll("passes pass");
    Array.from(list).forEach((pass) => {
      const id = pass.getAttribute("editor-id");
      if (id) {
        oldPasses.push(pass);
        oldPassOrder.push(id ?? "");
        passMap[id] = pass;
      }
    });

    console.log("oldPasses", oldPasses);
    console.log("oldPassOrder", oldPassOrder);

    const index1 = oldPassOrder.indexOf(passid1);
    const index2 = oldPassOrder.indexOf(passid2);
    if (index1 !== -1 && index2 !== -1) {
      const tmp = oldPassOrder[index1];
      oldPassOrder[index1] = oldPassOrder[index2];
      oldPassOrder[index2] = tmp;
    }

    console.log("reordered passes", oldPassOrder);

    const newPasses: Node[] = [];
    oldPassOrder.forEach((id) => {
      newPasses.push(passMap[id]);
    });
    console.log("newPasses", newPasses);

    const passesnode = this.doc.querySelector("passes");
    if (passesnode) {
      passesnode.innerHTML = "";
      newPasses.forEach((np) => {
        passesnode?.appendChild(np);
      });
    }
  }

  cloneWithoutPasses(): Promise<KLProject> {
    const newproject = new KLProject();
    newproject.setXML(this._xml, `Copy of ${this.filename}`);

    const passesnode = newproject.doc.querySelector("passes");
    if (passesnode) {
      passesnode.innerHTML = "";
    }

    return newproject;
  }

  cloneWithPasses(
    newPassIds: string[],
    passRepo: PassRepository
  ): Promise<KLProject> {
    const newproject = new KLProject();
    newproject.setXML(this._xml, this.filename);

    const passesnode = newproject.doc.querySelector("passes");
    if (passesnode) {
      passesnode.innerHTML = "";

      newPassIds.forEach((id) => {
        const pass = passRepo.getPass(id);

        const parser = new DOMParser();
        const doc = parser.parseFromString(pass.outerXml, "application/xml");

        passesnode.appendChild(doc.firstChild);
      });
    }

    // const emptycopy = await this.createCopyWithoutPasses();
    // \newproject.setXML(this._xml, `Copy of ${this.filename}`);

    return newproject;
  }

  getPass(id: string): Pass | undefined {
    let ret: Pass | undefined = undefined;

    const passes = this.doc.querySelectorAll("passes pass");
    Array.from(passes).forEach((pass) => {
      const passid = pass.getAttribute("editor-id");
      const label = pass.querySelector("properties label");
      if (passid && passid === id) {
        const passInfo: PassInfo = {
          id: passid,
          label: label?.textContent ?? "",
          enabled: undefined,
        };

        ret = {
          id: id,
          sourceFile: this.filename ?? "",
          outerXml: pass.outerHTML,
          passInfo,
        };
      }
    });

    return ret;
  }

  removeAllPasses() {}

  replacePass(id: string, pass: Pass) {
    return;
  }

  removePass(id: string) {}

  addPass(pass: Pass) {
    return undefined;
  }

  getPassOrder(): string[] {
    const order = [];
    // assign unique id's to each pass
    const passes = this.doc.querySelectorAll("passes pass");
    Array.from(passes).forEach((pass) => {
      const id = pass.getAttribute("editor-id");
      if (id) {
        order.push(id);
      }
    });

    return order;
  }

  setPassOrder(order: string[]) {
    return undefined;
  }
}
