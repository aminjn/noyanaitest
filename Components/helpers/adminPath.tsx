import { adminKey } from "../config";

export const adminPath = (rest: string) => `/${adminKey}${rest}`;
