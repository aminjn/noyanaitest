import { defaultImage, FilePath } from "../config";

// A stored file is a path under the backend's Public/ folder. Records
// brought over from the old site may instead hold an absolute URL (its file
// could not be copied here, backend Lib/oldFiles.ts): that one is used as is.
export const isAbsoluteFileUrl = (fileName: string) => /^https?:\/\//i.test(fileName);

export const imagePath = (fileName: string | undefined) =>
  fileName ? (isAbsoluteFileUrl(fileName) ? fileName : `${FilePath}/${fileName}`) : defaultImage;
