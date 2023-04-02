export interface PassInfo {
  id: string;
  label: string;
  enabled?: boolean;
}

export interface Pass {
  id: string;
  sourceFile: string;
  outerXml: string;
  passInfo?: PassInfo;
}

export interface ListDropEventDetails {
  draggedFromList: string;
  draggedFromIndex: number | undefined;
  draggedId: string;
  dropInList: string;
  dropAsIndex: number | undefined;
  dropAfter: string | undefined;
  dropBefore: string | undefined;
  copying: boolean | undefined;
}

export interface UploadEventDetails {
  file: File;
}

export interface DownloadProjectEventDetails {
  xml: boolean;
}

export interface ListRemoveEventDetails {
  list: string;
  id: string;
}
