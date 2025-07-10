import { defaultImage, FilePath } from "../config";

export const imagePath = (fileName: string | undefined) =>
  fileName ? `${FilePath}/${fileName}` : defaultImage;
