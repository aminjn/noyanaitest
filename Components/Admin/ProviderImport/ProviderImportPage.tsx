"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { adminIntlTag, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Box from "@/Components/Admin/UI/Box";
import Table from "@/Components/Admin/UI/Table";
import MapJobProgress from "@/Components/Admin/AppConfig/MapJobProgress";
import { ListEditor } from "./MappingEditor";
import PreviewPanel from "./PreviewPanel";
import ImportReportView, { downloadJson } from "./ImportReportView";
import { kindLabel, statusLabel } from "./labels";
import { Catalog, ImportKind, ImportRow, ListMapping, Mapping, Preview, Template, UploadResult } from "./types";
import classes from "./ProviderImport.module.css";

// «ورود گروهی (JSON)»: the super admin loads many doctors, offices, clinics,
// hospitals, labs, pharmacies and insurers from one JSON file of any shape
// (backend Services/providerImport.ts). Upload -> pick which record list is
// what -> map the fields (our own format maps itself) with a live preview
// -> save the mapping as a template -> dry run -> run with progress ->
// report. The file stays on the server; the mapping runs there too.
//
// Benchmark: Doctolib / Docplanner onboard practices in bulk through their
// sales ops with CSV templates and claim the listing afterwards; Paziresh24
// lists unclaimed doctors from the council directory. Here the owner's own
// exports are mapped field by field instead of re-typed into a template,
// and the imported pages are claimed through the same council + SMS OTP
// onboarding as any doctor.

const BASE = `${API}/admin/import`;
const numbers = adminNumberFormat();
const KINDS: ImportKind[] = ["doctor", "office", "clinic", "hospital", "pharmacy", "lab", "insurer"];

const useCatalog = () =>
  useSWR<Catalog>(`${BASE}/providers/catalog`, (url: string) => fetcher({ url }).then((r) => r.data));

const isMapping = (v: unknown): v is Mapping =>
  !!v && typeof v === "object" && Array.isArray((v as Mapping).lists) && (v as Mapping).lists.every((l) => l && typeof l.path === "string" && typeof l.kind === "string");

const formatDate = (v?: string) =>
  v ? new Date(v).toLocaleString(adminIntlTag(), { timeZone: TEHRAN_TZ, dateStyle: "medium", timeStyle: "short" }) : "";

const History = ({ onOpen, refreshKey }: { onOpen: (row: ImportRow) => void; refreshKey: number }) => {
  const { data, mutate } = useSWR<ImportRow[]>(`${BASE}/providers`, (url: string) =>
    fetcher({ url }).then((r) => (Array.isArray(r.data) ? r.data : [])),
  );
  useEffect(() => {
    if (refreshKey) mutate();
  }, [refreshKey, mutate]);
  const pushNotification = useNotification();
  const download = async (row: ImportRow) => {
    try {
      const full = await fetcher({ url: `${BASE}/providers/${row._id}` });
      const rep = full.data?.report || full.data?.validation;
      if (rep) downloadJson(rep, `${row.fileName.replace(/\.json$/i, "")}-report.json`);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };
  if (!data?.length) return <p className={classes.hint}>{ta("هنوز ورود گروهی انجام نشده است.")}</p>;
  return (
    <Table
      name="AdminProviderImportHistory"
      data={data}
      renderer={{
        fileName: { name: ta("فایل"), value: (r) => r.fileName, filter: "Text" },
        createdAt: { name: ta("زمان"), value: (r) => new Date(r.createdAt), filter: "Date" },
        status: {
          name: ta("وضعیت"),
          value: (r) => statusLabel(r.status),
          component: (r) => (
            <Badge color={r.status === "done" ? "Success" : r.status === "failed" ? "Error" : r.status === "validated" ? "Info" : "Secondary"}>
              {statusLabel(r.status)}
            </Badge>
          ),
          filter: "Multi",
        },
        counts: {
          name: ta("نتیجه"),
          value: (r) => {
            const t = r.report?.totals || r.validation?.totals;
            return t ? ta("${1} جدید، ${2} به‌روز، ${3} بدون تغییر، ${4} ناموفق", [t.create, t.update, t.unchanged, t.fail]) : "";
          },
        },
        by: { name: ta("کاربر"), value: (r) => [r.createdBy?.firstName, r.createdBy?.lastName].filter(Boolean).join(" ") || r.createdBy?.phone || "" },
        actions: {
          name: ta("عملیات"),
          component: (r) => (
            <div className={classes.rowActions}>
              {(!!r.report || !!r.validation) && (
                <Button size="S" variant="Neutral" onClick={() => download(r)}>
                  {ta("گزارش")}
                </Button>
              )}
              {!r.fileDeleted && r.status !== "done" && r.status !== "applying" && r.status !== "validating" && (
                <Button size="S" variant="Neutral" onClick={() => onOpen(r)}>
                  {ta("ادامه")}
                </Button>
              )}
            </div>
          ),
        },
      }}
    />
  );
};

const ProviderImportPage = () => {
  const pushNotification = useNotification();
  const { data: catalog } = useCatalog();
  const { data: templates, mutate: mutateTemplates } = useSWR<Template[]>(`${BASE}/templates`, (url: string) =>
    fetcher({ url }).then((r) => (Array.isArray(r.data) ? r.data : [])),
  );
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [mapping, setMapping] = useState<Mapping>({ version: 1, lists: [] });
  const [preview, setPreview] = useState<Preview>();
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateUsed, setTemplateUsed] = useState<string>();
  const [validatedFor, setValidatedFor] = useState<string>();
  const [historyKey, setHistoryKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const mappingFileRef = useRef<HTMLInputElement>(null);
  const importId = upload?.import._id;

  const { data: job, mutate: mutateJob } = useSWR<ImportRow>(
    importId ? `${BASE}/providers/${importId}` : null,
    (url: string) => fetcher({ url }).then((r) => r.data),
    { refreshInterval: (latest) => (latest?.status === "validating" || latest?.status === "applying" ? 1000 : 0) },
  );
  const running = job?.status === "validating" || job?.status === "applying";
  const mappingText = useMemo(() => JSON.stringify(mapping), [mapping]);

  // the report came in: the history shows it too
  const lastStatus = useRef<string>();
  useEffect(() => {
    if (job?.status && lastStatus.current && lastStatus.current !== job.status) setHistoryKey((k) => k + 1);
    lastStatus.current = job?.status;
  }, [job?.status]);

  // live preview, a moment after the last change
  useEffect(() => {
    if (!importId || !mapping.lists.length) {
      setPreview(undefined);
      return;
    }
    let live = true;
    setPreviewing(true);
    const timer = setTimeout(() => {
      fetcher({ url: `${BASE}/providers/${importId}/preview`, method: "POST", payload: { mapping } })
        .then((r) => live && setPreview(r.data))
        .catch((err) => live && pushNotification((err as Error).message, "Error"))
        .finally(() => live && setPreviewing(false));
    }, 600);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importId, mappingText]);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (catalog && file.size > catalog.maxBytes) return pushNotification(ta("حجم فایل بیش از ۲۰ مگابایت است"), "Error");
    setUploading(true);
    try {
      const r = await fetcher<{ data: UploadResult }>({ url: `${BASE}/providers/upload`, method: "POST", payload: { file }, bodyParser: "FORM" });
      setUpload(r.data);
      setMapping(r.data.suggestion);
      setTemplateUsed(undefined);
      setValidatedFor(undefined);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setUploading(false);
    }
  };

  const reopen = async (row: ImportRow) => {
    try {
      const r = await fetcher<{ data: UploadResult }>({ url: `${BASE}/providers/${row._id}/source` });
      setUpload({ ...r.data, import: row });
      setMapping(isMapping(row.mapping) ? row.mapping : r.data.suggestion);
      setValidatedFor(row.status === "validated" && row.mapping ? JSON.stringify(row.mapping) : undefined);
      mutateJob();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  const setListKind = (path: string, kind: ImportKind | "") => {
    const others = mapping.lists.filter((l) => l.path !== path);
    if (!kind) return setMapping({ ...mapping, lists: others });
    const suggested = upload?.suggestions?.[path]?.[kind];
    setMapping({ ...mapping, lists: [...others, suggested ? { ...suggested, path } : { path, kind, fields: {}, children: [] }] });
  };

  const setList = useCallback(
    (index: number, next: ListMapping) => setMapping((m) => ({ ...m, lists: m.lists.map((l, i) => (i === index ? next : l)) })),
    [],
  );

  const start = async (mode: "validate" | "apply") => {
    if (!importId || starting || running) return;
    setStarting(true);
    try {
      await fetcher({
        url: mode === "apply" ? `${BASE}/providers` : `${BASE}/providers/validate`,
        method: "POST",
        payload: { importId, mapping, ...(templateUsed ? { template: templateUsed } : {}) },
      });
      if (mode === "validate") setValidatedFor(mappingText);
      await mutateJob();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setStarting(false);
    }
  };

  const saveTemplate = async () => {
    const name = templateName.trim();
    if (!name) return pushNotification(ta("نام الگو را بنویسید"), "Error");
    try {
      await fetcher({ url: `${BASE}/templates`, method: "POST", payload: { name, mapping } });
      await mutateTemplates();
      setTemplateUsed(name);
      pushNotification(ta("الگوی «${1}» ذخیره شد", [name]), "Success");
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  const loadTemplate = (id: string) => {
    const t = templates?.find((x) => x._id === id);
    if (!t || !isMapping(t.mapping)) return;
    setMapping(t.mapping);
    setTemplateUsed(t.name);
    setTemplateName(t.name);
  };

  const deleteTemplate = async (id: string) => {
    try {
      await fetcher({ url: `${BASE}/templates/${id}`, method: "DELETE" });
      await mutateTemplates();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  const onMappingFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isMapping(parsed)) throw new Error();
      setMapping({ version: 1, lists: parsed.lists });
    } catch {
      pushNotification(ta("فایل نگاشت معتبر نیست"), "Error");
    }
  };

  const report = job?.status === "done" ? job.report : undefined;
  const validation = job?.validation;
  const validatedCurrent = job?.status === "validated" && validatedFor === mappingText;
  const missingLists = mapping.lists.filter((l) => upload && !upload.lists.some((s) => s.path === l.path));

  return (
    <div className={classes.main}>
      <Box className={classes.section}>
        <h3 className={classes.sectionTitle}>{ta("۱. فایل")}</h3>
        <p className={classes.hint}>
          {ta("فایل JSON با هر ساختاری پذیرفته می‌شود: فهرستی از رکوردها یا شیئی که فهرست‌ها را در خود دارد. قالب خود نویان (نمونه‌ی زیر) بدون نگاشت شناخته می‌شود. پروفایل‌ها به‌صورت «ادعانشده» در سایت نمایش داده می‌شوند و هیچ پیامکی فرستاده نمی‌شود؛ پزشک یا مرکز بعداً صفحه‌ی خود را با کد نظام پزشکی و کد پیامکی ادعا می‌کند.")}
        </p>
        <div className={classes.actionsRow}>
          <a className={classes.download} href="/samples/noyan-providers-sample.json" download>
            {ta("دریافت فایل نمونه")}
          </a>
          <a className={classes.download} href="/samples/noyan-providers.schema.json" download>
            {ta("دریافت JSON Schema")}
          </a>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={onFile} />
          <Button size="M" isLoading={uploading} onClick={() => fileRef.current?.click()}>
            {ta("بارگذاری فایل JSON")}
          </Button>
        </div>
        {!!upload && (
          <p className={classes.fileLine}>
            <strong dir="auto">{upload.import.fileName}</strong>
            <span>{ta("${1} کیلوبایت", [numbers.format(Math.round((upload.import.size || 0) / 1024))])}</span>
            {upload.native && <Badge color="Success">{ta("قالب نویان؛ نگاشت خودکار")}</Badge>}
          </p>
        )}
      </Box>

      {!!upload && !!catalog && (
        <Box className={classes.section}>
          <h3 className={classes.sectionTitle}>{ta("۲. فهرست‌ها و نگاشت فیلدها")}</h3>
          <div className={classes.templates}>
            <select className={classes.select} value="" onChange={(e) => e.target.value && loadTemplate(e.target.value)} aria-label={ta("بارگذاری الگو")}>
              <option value="">{ta("استفاده از الگوی ذخیره‌شده")}</option>
              {(templates || []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              className={classes.text}
              value={templateName}
              placeholder={ta("نام الگو")}
              onChange={(e) => setTemplateName(e.target.value)}
              aria-label={ta("نام الگو")}
            />
            <Button size="S" variant="Neutral" onClick={saveTemplate}>
              {ta("ذخیره‌ی نگاشت به‌عنوان الگو")}
            </Button>
            <Button size="S" variant="Neutral" onClick={() => downloadJson(mapping, `${templateName.trim() || "mapping"}.json`)}>
              {ta("خروجی نگاشت (JSON)")}
            </Button>
            <input ref={mappingFileRef} type="file" accept=".json,application/json" hidden onChange={onMappingFile} />
            <Button size="S" variant="Neutral" onClick={() => mappingFileRef.current?.click()}>
              {ta("ورود نگاشت از فایل")}
            </Button>
            {!!templateUsed && (
              <>
                <Badge color="Info">{ta("الگو: ${1}", [templateUsed])}</Badge>
                {templates?.some((t) => t.name === templateUsed) && (
                  <button
                    type="button"
                    className={classes.linkButton}
                    onClick={() => deleteTemplate(templates.find((t) => t.name === templateUsed)!._id)}
                  >
                    {ta("حذف الگو")}
                  </button>
                )}
              </>
            )}
          </div>
          <div className={classes.lists}>
            {upload.lists.map((l) => {
              const chosen = mapping.lists.find((m) => m.path === l.path);
              return (
                <div key={l.path} className={classes.listPick}>
                  <span className={classes.listPath} dir="ltr">
                    {l.path || ta("ریشه‌ی فایل")}
                  </span>
                  <span className={classes.fieldMeta}>{ta("${1} رکورد، ${2} فیلد", [numbers.format(l.count), numbers.format(l.fields.length)])}</span>
                  <select
                    className={classes.select}
                    value={chosen?.kind || ""}
                    onChange={(e) => setListKind(l.path, e.target.value as ImportKind | "")}
                    aria-label={ta("این فهرست چیست؟")}
                  >
                    <option value="">{ta("وارد نشود")}</option>
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {kindLabel(k)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {!!missingLists.length && (
            <p className={classes.warn}>
              {ta("این فهرست‌های الگو در فایل نیستند: ${1}", [missingLists.map((l) => l.path || "/").join("، ")])}
            </p>
          )}
          {mapping.lists.map((list, i) => {
            const source = upload.lists.find((s) => s.path === list.path);
            if (!source) return null;
            return (
              <details key={`${list.path}-${list.kind}`} className={classes.listBlock} open={i === 0}>
                <summary className={classes.listSummary}>
                  <span>{kindLabel(list.kind)}</span>
                  <span className={classes.listPath} dir="ltr">
                    {list.path || "/"}
                  </span>
                  <span className={classes.fieldMeta}>{ta("${1} فیلد نگاشت شده", [numbers.format(Object.keys(list.fields).length)])}</span>
                </summary>
                <ListEditor
                  kind={list.kind}
                  source={source}
                  mapping={list}
                  onChange={(m) => setList(i, m)}
                  catalog={catalog}
                  valueKey={String(i)}
                  preview={preview}
                />
              </details>
            );
          })}
        </Box>
      )}

      {!!upload && !!mapping.lists.length && (
        <Box className={classes.section}>
          <h3 className={classes.sectionTitle}>{ta("۳. پیش‌نمایش")}</h3>
          <PreviewPanel preview={preview} loading={previewing} />
        </Box>
      )}

      {!!upload && !!mapping.lists.length && (
        <Box className={classes.section}>
          <h3 className={classes.sectionTitle}>{ta("۴. بررسی و اعمال")}</h3>
          <p className={classes.hint}>
            {ta("بررسی همه‌ی رکوردها را مثل اجرای واقعی می‌سنجد (تطبیق تخصص‌ها، بیمه‌ها، مراکز و رکوردهای موجود) اما چیزی ذخیره نمی‌کند. اجرای دوباره همان فایل رکورد تکراری نمی‌سازد و پروفایلی که صاحبش آن را ادعا کرده فقط در فیلدهای خالی پر می‌شود.")}
          </p>
          <div className={classes.actionsRow}>
            <Button size="M" variant="Neutral" isLoading={starting && !validatedCurrent} onClick={() => start("validate")} >
              {ta("بررسی (بدون ذخیره)")}
            </Button>
            <Button
              size="M"
              variant={validatedCurrent && !running ? "Primary" : "Disable"}
              isLoading={job?.status === "applying"}
              onClick={validatedCurrent && !running ? () => start("apply") : undefined}
            >
              {ta("اعمال")}
            </Button>
            {!validatedCurrent && job?.status !== "done" && <span className={classes.fieldMeta}>{ta("پیش از اعمال، نگاشت فعلی را بررسی کنید.")}</span>}
          </div>
          {!!job && (running || job.status === "failed" || job.status === "done") && (
            <MapJobProgress
              job={{
                status: running ? "running" : job.status === "failed" ? "failed" : "done",
                phase: job.progress?.phase || "",
                total: job.progress?.total || 0,
                processed: job.progress?.processed || 0,
                startedAt: job.startedAt || job.createdAt,
                ...(job.error ? { error: { message: job.error } } : {}),
              } as never}
              phaseText={(phase) =>
                phase === "availability"
                  ? ta("ساخت نوبت‌های خالی از ساعت‌های کاری")
                  : phase === "starting"
                    ? ta("در حال شروع")
                    : KINDS.includes(phase as ImportKind)
                      ? kindLabel(phase)
                      : undefined
              }
            />
          )}
          {!!report && <ImportReportView report={report} fileName={job?.fileName} />}
          {!report && !!validation && job?.status !== "applying" && <ImportReportView report={validation} fileName={job?.fileName} />}
        </Box>
      )}

      <Box className={classes.section}>
        <h3 className={classes.sectionTitle}>{ta("سابقه‌ی ورودهای گروهی")}</h3>
        <History onOpen={reopen} refreshKey={historyKey} />
      </Box>
    </div>
  );
};

export default ProviderImportPage;
