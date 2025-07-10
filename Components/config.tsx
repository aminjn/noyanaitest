import DefaultImage from "./Logo.png";

export const defaultImage = DefaultImage;

const api = process.env.API;

if (!api) throw new Error("Please Set 'API' in .env.local");

export const API = api;

export const FilePath = "http://127.0.0.1/files";

const _adminKey = process.env.ADMIN_KEY;

if (!_adminKey) throw new Error("Please Set 'ADMIN_KEY' in .env.local");

export const adminKey = _adminKey;

export const FILE_PATH = "http://127.0.0.1/files";
