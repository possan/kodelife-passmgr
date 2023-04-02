export class PackedKLProject {
  filename: string | undefined;
  _bin: ArrayBuffer | undefined;

  constructor() {
    this._bin = undefined;
    this.filename = undefined;
  }

  loadFromArray(data: ArrayBuffer, filename: string): Promise<void> {
    console.log("loading file", data, filename);
    this.filename = filename;
    this._bin = data;
    return Promise.resolve();
  }
}
