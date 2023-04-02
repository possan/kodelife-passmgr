import { PackedKLProject } from "./packed";
import { KLProject } from "./unpacked";
import * as pako from "pako";

export class KLProjectPacker {
  _xml: string | undefined;
  filename: string | undefined;

  constructor() {
    this._xml = undefined;
    this.filename = undefined;
  }

  unpackAndParse(input: PackedKLProject): Promise<KLProject> {
    if (!input._bin) {
      return Promise.reject();
    }

    const arrbuff = new Uint8Array(input._bin);
    console.log("buff", arrbuff);

    try {
      // const result = pako.inflate(compressed);
      // ... continue processing

      // var uint8array = new TextEncoder().encode("someString");

      const output = pako.inflate(arrbuff);
      console.log("output", output);

      const xml = new TextDecoder().decode(output);
      console.log("xml", xml);

      const k = new KLProject();
      k.setXML(xml, input.filename ?? "");

      return Promise.resolve(k);
    } catch (err) {
      console.log("defalate failed", err);
      return Promise.reject();
    }
  }

  async serializeAndPack(input: KLProject): Promise<PackedKLProject> {
    const xml = await input.getXML();
    console.log("xml", xml);

    var uint8array = new TextEncoder().encode(xml);
    console.log("uint8array", uint8array);

    try {
      const packed = pako.deflate(uint8array);
      console.log("packed", packed);

      const k = new PackedKLProject();
      await k.loadFromArray(packed, input.filename ?? "Unnamed.klproj");

      return Promise.resolve(k);
    } catch (err) {
      console.log("defalate failed", err);
      return Promise.reject();
    }
  }
}
