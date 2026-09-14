import DefaultImage from "./Logo.png";

export const defaultImage = DefaultImage;

const api = process.env.API;

if (!api) throw new Error("Please Set 'API' in .env.local");

export const API = api;

const _adminKey = process.env.ADMIN_KEY;

if (!_adminKey) throw new Error("Please Set 'ADMIN_KEY' in .env.local");

export const adminKey = _adminKey;

const _filePath = process.env.FILE_PATH || "http://127.0.0.1/files";

export const FilePath = _filePath;

export const FILE_PATH = _filePath;

export const DoctorsPerPage = 25;

const _backend = process.env.BACKEND;

if (!_backend) throw new Error("Please Set 'BACKEND' in .env.local");

export const BACKEND = _backend;

const _domain = process.env.DOMAIN;

if (!_domain) throw new Error("Please Set 'DOMAIN' in .env.local");

// public-facing origin of this site, used to build absolute URLs (sitemaps, canonical links)
export const DOMAIN = _domain;
