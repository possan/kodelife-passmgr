import "./style.css";

import "./components/button.ts";
import "./components/passlist.ts";
import "./components/upload.ts";
import "./components/projectheader.ts";

import { KLProject } from "./model/unpacked";
import { PackedKLProject } from "./model/packed";
import { KLProjectPacker } from "./model/packer";
import {
  DownloadProjectEventDetails,
  ListDropEventDetails,
  ListRemoveEventDetails,
  PassInfo,
} from "./types/editor";
import { PassRepository } from "./model/passrepo";
import { PassList } from "./model/passlist";
import { ProjectHeaderElement } from "./components/projectheader";
import { PassListElement } from "./components/passlist";

function load() {
  const passrepo = new PassRepository();
  const packer = new KLProjectPacker();

  let project1: KLProject | undefined = undefined;
  let project2: KLProject | undefined = undefined;
  let project3: KLProject | undefined = undefined;

  const project1header = document.getElementById(
    "project1header"
  ) as HTMLElement & ProjectHeaderElement;
  const project2header = document.getElementById(
    "project2header"
  ) as HTMLElement & ProjectHeaderElement;
  const project3header = document.getElementById(
    "project3header"
  ) as HTMLElement & ProjectHeaderElement;

  const project1passlistelement = document.getElementById(
    "project1passlist"
  ) as HTMLElement & PassListElement;
  const project2passlistelement = document.getElementById(
    "project2passlist"
  ) as HTMLElement & PassListElement;
  const project3passlistelement = document.getElementById(
    "project3passlist"
  ) as HTMLElement & PassListElement;

  const project1passlist = new PassList([]);
  const project2passlist = new PassList([]);
  const project3passlist = new PassList([]);

  async function handleDownloadBlob(blob: Blob, filename: string) {
    console.log("download blob", blob, filename);

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  async function handleDownload(
    project: KLProject | undefined,
    passIds: string[],
    details: DownloadProjectEventDetails
  ) {
    console.log("download", project, details);

    if (!project) {
      return;
    }

    const modifiedProject = await project.cloneWithPasses(passIds, passrepo);

    if (details.xml) {
      const xml = await modifiedProject.getXML();

      const blob = new Blob([xml], { type: "text/xml" });
      return handleDownloadBlob(
        blob,
        `Modified ${modifiedProject.filename}.xml`
      );
    }

    const packed = await packer.serializeAndPack(modifiedProject);
    console.log("packed", packed);

    var byteArray = new Uint8Array(packed._bin);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    return handleDownloadBlob(blob, `Modified ${modifiedProject.filename}`);
  }

  async function handleUpload(file: File): Promise<KLProject> {
    return new Promise((resolve, reject) => {
      console.log("file uploaded", file);

      var reader = new FileReader();
      reader.onload = async function (e2: ProgressEvent<FileReader>) {
        // binary data
        const bindata = e2?.target?.result;
        console.log("binary", bindata);
        if (!bindata) {
          reject("err");
          return;
        }

        const packed = new PackedKLProject();
        try {
          await packed.loadFromArray(bindata, file.name);
        } catch (e) {
          reject(e);
          return;
        }

        console.log("packed", packed);

        const unpacked = await packer.unpackAndParse(packed);
        if (!unpacked) {
          reject("err");
          return;
        }

        passrepo.getAllPassesFromProject(unpacked);

        console.log("unpacked", unpacked);
        resolve(unpacked);
      };

      reader.onerror = function (e) {
        console.log("Error : " + e.type);
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  function updateProject1IfEmpty(source: KLProject) {
    if (!project1) {
      project1 = source;
      project1passlist.replaceAll(
        passrepo.getPassInfoList(project1.getPassOrder())
      );
      project1header?.setProject(project1);
      project1passlistelement?.setList(project1passlist.passes);
    }
  }

  function updateProject2IfEmpty(source: KLProject) {
    if (!project2) {
      project2 = source;
      project2passlist.replaceAll(
        passrepo.getPassInfoList(project2.getPassOrder())
      );
      project2header?.setProject(project2);
      project2passlistelement?.setList(project2passlist.passes);
    }
  }

  function updateProject3IfEmpty(source: KLProject) {
    if (!project3) {
      project3 = source;
      project3passlist.replaceAll(
        passrepo.getPassInfoList(project3.getPassOrder())
      );
      project3header?.setProject(project3);
      project3passlistelement?.setList(project3passlist.passes);
    }
  }

  async function handleUploadProject1(file: File): Promise<KLProject> {
    const tmp = await handleUpload(file);
    if (!tmp) {
      return Promise.reject();
    }
    passrepo.getAllPassesFromProject(tmp);

    project1 = tmp;
    project1passlist.replaceAll(
      passrepo.getPassInfoList(project1.getPassOrder())
    );
    project1header?.setProject(project1);
    project1passlistelement?.setList(project1passlist.passes);

    passrepo.stats();

    const tmp2 = await tmp.cloneWithoutPasses();
    return tmp2;
  }

  async function handleUploadProject2(file: File): Promise<KLProject> {
    const tmp = await handleUpload(file);
    if (!tmp) {
      return Promise.reject();
    }
    passrepo.getAllPassesFromProject(tmp);

    project2 = tmp;
    project2passlist.replaceAll(
      passrepo.getPassInfoList(project2.getPassOrder())
    );
    project2header?.setProject(project2);
    project2passlistelement?.setList(project2passlist.passes);

    passrepo.stats();

    const tmp2 = await tmp.cloneWithoutPasses();
    return tmp2;
  }

  async function handleUploadProject3(file: File): Promise<KLProject> {
    const tmp = await handleUpload(file);
    if (!tmp) {
      return Promise.reject();
    }
    passrepo.getAllPassesFromProject(tmp);

    project3 = tmp;
    project3passlist.replaceAll(
      passrepo.getPassInfoList(project3.getPassOrder())
    );
    project3header?.setProject(project3);
    project3passlistelement?.setList(project3passlist.passes);

    passrepo.stats();

    const tmp2 = await tmp.cloneWithoutPasses();
    return tmp2;
  }

  project1header.addEventListener("upload", async (e) => {
    const clone = await handleUploadProject1(e.detail.file);
    updateProject1IfEmpty(clone);
    updateProject2IfEmpty(clone);
    updateProject3IfEmpty(clone);
  });

  project2header.addEventListener("upload", async (e) => {
    const clone = await handleUploadProject2(e.detail.file);
    updateProject1IfEmpty(clone);
    updateProject2IfEmpty(clone);
    updateProject3IfEmpty(clone);
  });

  project3header.addEventListener("upload", async (e) => {
    const clone = await handleUploadProject3(e.detail.file);
    updateProject1IfEmpty(clone);
    updateProject2IfEmpty(clone);
    updateProject3IfEmpty(clone);
  });

  project1header?.addEventListener("clear", async (e) => {
    project1 = undefined;
    project1header?.setProject(project1);
    project1passlist.clear();
    project1passlistelement?.setList(project1passlist.passes);
  });

  project2header?.addEventListener("clear", async (e) => {
    project2 = undefined;
    project2header?.setProject(project2);
    project2passlist.clear();
    project2passlistelement?.setList(project2passlist.passes);
  });

  project3header?.addEventListener("clear", async (e) => {
    project3 = undefined;
    project3header?.setProject(project3);
    project3passlist.clear();
    project3passlistelement?.setList(project3passlist.passes);
  });

  project1header?.addEventListener("download", async (e) =>
    handleDownload(project1, project1passlist.getIds(), e.detail)
  );

  project2header?.addEventListener("download", async (e) =>
    handleDownload(project2, project2passlist.getIds(), e.detail)
  );

  project3header?.addEventListener("download", async (e) =>
    handleDownload(project3, project3passlist.getIds(), e.detail)
  );

  function handleRemove(ed: ListRemoveEventDetails) {
    console.log("handle drop", ed);

    if (ed.list === "project1passlist") {
      project1passlist.removeById(ed.id);
    }
    if (ed.list === "project2passlist") {
      project2passlist.removeById(ed.id);
    }
    if (ed.list === "project3passlist") {
      project3passlist.removeById(ed.id);
    }

    project1passlistelement?.setList(project1passlist.passes);
    project2passlistelement?.setList(project2passlist.passes);
    project3passlistelement?.setList(project3passlist.passes);
  }

  function handleDrop(ed: ListDropEventDetails) {
    console.log("handle drop", ed);

    if (ed.copying) {
      let moved: PassInfo | undefined;

      if (ed.draggedFromList === "project1passlist") {
        moved = project1passlist.get(ed.draggedFromIndex ?? -1);
      }
      if (ed.draggedFromList === "project2passlist") {
        moved = project2passlist.get(ed.draggedFromIndex ?? -1);
      }
      if (ed.draggedFromList === "project3passlist") {
        moved = project3passlist.get(ed.draggedFromIndex ?? -1);
      }

      if (ed.dropInList === "project1passlist" && moved) {
        project1passlist.insertAt(ed.dropAsIndex ?? -1, moved);
      }
      if (ed.dropInList === "project2passlist" && moved) {
        project2passlist.insertAt(ed.dropAsIndex ?? -1, moved);
      }
      if (ed.dropInList === "project3passlist" && moved) {
        project3passlist.insertAt(ed.dropAsIndex ?? -1, moved);
      }
    } else {
      if (ed.draggedFromList === ed.dropInList) {
        // just rearranging same list

        if (ed.dropInList === "project1passlist") {
          project1passlist.move(
            ed.draggedFromIndex ?? -1,
            ed.dropAsIndex ?? -1
          );
        }

        if (ed.dropInList === "project2passlist") {
          project2passlist.move(
            ed.draggedFromIndex ?? -1,
            ed.dropAsIndex ?? -1
          );
        }

        if (ed.dropInList === "project3passlist") {
          project3passlist.move(
            ed.draggedFromIndex ?? -1,
            ed.dropAsIndex ?? -1
          );
        }
      } else {
        // moving between lists, remove from first list and insert in new list

        let moved: PassInfo | undefined;

        if (ed.draggedFromList === "project1passlist") {
          moved = project1passlist.get(ed.draggedFromIndex ?? -1);
        }
        if (ed.draggedFromList === "project2passlist") {
          moved = project2passlist.get(ed.draggedFromIndex ?? -1);
        }
        if (ed.draggedFromList === "project3passlist") {
          moved = project3passlist.get(ed.draggedFromIndex ?? -1);
        }

        console.log("moved", moved);

        if (ed.dropInList === "project1passlist" && moved) {
          project1passlist.insertAt(ed.dropAsIndex ?? -1, moved);
        }
        if (ed.dropInList === "project2passlist" && moved) {
          project2passlist.insertAt(ed.dropAsIndex ?? -1, moved);
        }
        if (ed.dropInList === "project3passlist" && moved) {
          project3passlist.insertAt(ed.dropAsIndex ?? -1, moved);
        }

        if (ed.draggedFromList === "project1passlist") {
          project1passlist.removeAt(ed.draggedFromIndex ?? -1);
        }
        if (ed.draggedFromList === "project2passlist") {
          project2passlist.removeAt(ed.draggedFromIndex ?? -1);
        }
        if (ed.draggedFromList === "project3passlist") {
          project3passlist.removeAt(ed.draggedFromIndex ?? -1);
        }
      }
    }

    project1passlistelement?.setList(project1passlist.passes);
    project2passlistelement?.setList(project2passlist.passes);
    project3passlistelement?.setList(project3passlist.passes);
  }

  project1header.setProject(project1);
  project2header.setProject(project2);
  project3header.setProject(project3);

  project1passlistelement.setList(project1passlist.passes);
  project2passlistelement.setList(project2passlist.passes);
  project3passlistelement.setList(project3passlist.passes);

  project1passlistelement.addEventListener("drop", (e) => {
    handleDrop(e.detail);
  });

  project2passlistelement.addEventListener("drop", (e) => {
    handleDrop(e.detail);
  });

  project3passlistelement.addEventListener("drop", (e) => {
    handleDrop(e.detail);
  });

  project1passlistelement.addEventListener("remove", (e) => {
    handleRemove(e.detail);
  });

  project2passlistelement.addEventListener("remove", (e) => {
    handleRemove(e.detail);
  });

  project3passlistelement.addEventListener("remove", (e) => {
    handleRemove(e.detail);
  });
}

window.addEventListener("load", load);
