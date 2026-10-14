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
  // how the value is read (backend Lib/providerImport/mapping.ts ruleExtracts)
  extract?: Extract;
  // put before the value (an id namespace: "drdr:")
  prefix?: string;
};
export type Extract = "urlId" | "imageUrl" | "joinedList" | "hashId";
// a built-in partner template: missing catalogue names are created at once
export type MappingOptions = { autoCreate?: boolean };
export type ListMapping = { path: string; kind: AnyKind; fields: Record<string, Rule>; children?: ListMapping[] };
export type Mapping = { version: 1; lists: ListMapping[]; options?: MappingOptions };

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
  place?: { province?: string; city?: string; by?: "point" | "address" };
};
export type ExtractionStats = {
  doctors: number;
  photo: number;
  specialityMain: number;
  specialitySuggested: number;
  specialityNew: number;
  specialityQueued?: number;
  fellowships: number;
  diseases: { records: number; matched: number; created: number; leftovers: number };
  services: { records: number; matched: number; created: number; leftovers: number };
  place: { point: number; address: number; none: number; conflicts: number };
};
export type ImportReport = {
  mode: "validate" | "apply";
  totals: Totals;
  byKind: Record<string, Omit<Totals, "warnings" | "errors">>;
  records: ReportRecord[];
  created: { specialities: string[]; tests: string[]; categories: string[]; diseases?: string[]; services?: string[] };
  translationsPending: number;
  extraction?: ExtractionStats;
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
  // the built-in template of a recognised partner file (DrDr...)
  template?: Template | null;
};
export type PreviewRecord = {
  path: string;
  externalId?: string;
  data: Record<string, unknown>;
  translations: Record<string, Record<string, unknown>>;
  children: Record<string, PreviewRecord[]>;
  issues: Issue[];
  // what the doctor's names resolve to in our catalogues
  resolved?: {
    mainSpeciality?: string;
    specialities?: string[];
    services?: { matched: string[]; create: string[]; unknown: string[] };
    diseases?: { matched: string[]; create: string[]; unknown: string[] };
  };
};
export type NameRow = {
  value: string;
  match: "existing" | "new" | "unknown" | "suggest" | "skip" | "create";
  to?: string;
  suggestion?: string;
  count?: number;
  level?: string;
};
export type Preview = {
  lists: { listIndex: number; kind: AnyKind; path: string; total: number; records: PreviewRecord[] }[];
  values: Record<string, string[]>;
  names: Record<string, NameRow[]>;
  summary?: Record<string, { records: number; withValue: number; matched: number; leftovers: number }>;
  // an AI provider is configured (the joined-names split)
  ai?: boolean;
};
// where each field of a partner's record goes on the profile (built-in
// templates; backend Lib/providerImport/partners.ts)
export type PartnerDestination =
  | "name"
  | "speciality"
  | "phone"
  | "bio"
  | "diseases"
  | "services"
  | "location"
  | "address"
  | "photo"
  | "centreName"
  | "centrePhone"
  | "centreAddress"
  | "insurances"
  | "roundTheClock"
  | "pharmacist"
  | "ignored";
export type PartnerField = { source: string; to: PartnerDestination };
export type Template = { _id: string; name: string; mapping: Mapping; updatedAt: string; builtin?: string; fields?: PartnerField[] };
