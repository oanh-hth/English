// Given: the contract every storage backend follows. "Program to an interface": the rest of the app only knows this
// shape, so local disk (exercise 4.1) and a cloud bucket (exercise 7.2) can be swapped without touching any route.

export interface UploadTarget {
  /** Where the browser should PUT the file. Relative ("/api/...") means this server; absolute means the storage service. */
  url: string;
  /** Headers the browser must send with that PUT. */
  headers: Record<string, string>;
}

export interface ViewOptions {
  mime: string;
  filename: string;
  /** true: ask the browser to save the file; false: show it in the page. */
  download: boolean;
}

export interface Storage {
  /** true when the browser uploads straight to the storage service, false when it uploads to this server. */
  readonly direct: boolean;
  /** Tell the browser where to send the file for this key. */
  uploadTarget(key: string, size: number, uploadId: string): Promise<UploadTarget>;
  /** Size in bytes of the stored file, or null when it does not exist. */
  head(key: string): Promise<number | null>;
  /** The first `bytes` bytes of the file (fewer when the file is shorter). */
  readHead(key: string, bytes: number): Promise<Uint8Array>;
  /** Delete the file. Deleting a file that does not exist is not an error. */
  remove(key: string): Promise<void>;
  /** A temporary link the browser can open to see the file, or null when this server must stream the file itself. */
  getUrl(key: string, options: ViewOptions): Promise<string | null>;
  /** Only for local storage: where the file lives on disk. */
  localPath?(key: string): string;
}
