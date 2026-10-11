// Bulk provider import (backend Services/providerImport.ts,
// Lib/providerImport/*): the shapes the panel exchanges with
// /admin/import/providers.

export type ImportKind = "doctor" | "office" | "clinic" | "hospital" | "pharmacy" | "lab" | "insurer";
export type AnyKind = ImportKind | "hours" | "visitType" | "labTest";

export type FieldType =
  | "id" | "string" | "i18n" | "text" | "number" | "price" | "boolean" | "enum" | "list" | "url"
  | "phone" | "phoneList" | "lat" | "lng" | "point" | "day" | "time" | "timeRange" | "refList" | "ref";

export type TargetField = { key: string; type: FieldType; required?: boolean; enum?: string[]; example?: unknown };
export type ChildSpec = { key: string; kind: AnyKind };
export type Catalog = {
  kinds: ImportKind[];
  fields: Record<AnyKind, TargetField[]>;
  children: Record<AnyKind, ChildSpec[]>;
  maxBytes: number;
};

export type Transform = "trim" | "digits" | "phone" | "rialToToman" | "tomanToRial" | "lower" | "stripTitle" | "number";
export type Rule = {
  source?: string;
  sources?: string[];
  join?: string;
  constant?: string | number | boolean | string[];
  split?: { by: string; index?: number; rest?: boolean };
  transforms?: Transform[];
  valueMap?: Record<string, string>;
};
export type ListMapping = { path: string; kind: AnyKind; fields: Record<string, Rule>; children?: ListMapping[] };
export type Mapping = { version: 1; lists: ListMapping[] };

export type SourcePath = { path: string; samples: string[]; count: number; type: "string" | "number" | "boolean" | "list" | "object" };
export type SourceList = { path: string; count: number; fields: SourcePath[]; children: SourceList[] };

export type Issue = { level: "error" | "warning"; path: string; field?: string; code: string; params?: string[] };

export type ImportStatus = "uploaded" | "validating" | "validated" | "applying" | "done" | "failed";
export type Totals = { records: number; create: number; update: number; unchanged: number; fail: number; skip: number; warnings: number; errors: number };
export type ReportRecord = {
  kind: string;
  path: string;
  externalId?: string;
  name?: string;
  action: "create" | "update" | "unchanged" | "fail" | "skip";
  target?: string;
  claimed?: boolean;
  matchedBy?: string;
  issues: Issue[];
};
export type ImportReport = {
  mode: "validate" | "apply";
  totals: Totals;
  byKind: Record<string, Omit<Totals, "warnings" | "errors">>;
  records: ReportRecord[];
  created: { specialities: string[]; tests: string[]; categories: string[] };
  translationsPending: number;
  startedAt: string;
  finishedAt?: string;
};
export type ImportRow = {
  _id: string;
  fileName: string;
  size: number;
  status: ImportStatus;
  native: boolean;
  template?: string;
  fileDeleted: boolean;
  progress?: { phase: string; processed: number; total: number };
  validation?: ImportReport;
  report?: ImportReport;
  error?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  createdBy?: { firstName?: string; lastName?: string; phone?: string };
  mapping?: Mapping;
};
export type UploadResult = {
  import: ImportRow;
  native: boolean;
  lists: SourceList[];
  suggestion: Mapping;
  suggestions: Record<string, Partial<Record<ImportKind, ListMapping>>>;
};
export type PreviewRecord = {
  path: string;
  externalId?: string;
  data: Record<string, unknown>;
  translations: Record<string, Record<string, unknown>>;
  children: Record<string, PreviewRecord[]>;
  issues: Issue[];
};
export type Preview = {
  lists: { listIndex: number; kind: AnyKind; path: string; total: number; records: PreviewRecord[] }[];
  values: Record<string, string[]>;
  names: Record<string, { value: string; match: "existing" | "new" | "unknown"; to?: string }[]>;
};
export type Template = { _id: string; name: string; mapping: Mapping; updatedAt: string };
