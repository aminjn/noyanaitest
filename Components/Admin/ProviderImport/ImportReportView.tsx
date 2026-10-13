"use client";

import { useMemo } from "react";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import Table from "@/Components/Admin/UI/Table";
import { actionLabel, fieldLabel, issueText, kindLabel, placeByLabel } from "./labels";
import { ExtractionStats, ImportReport, ReportRecord } from "./types";
import classes from "./ProviderImport.module.css";

// The dry run's or the run's report (bulk provider import): counts, then
// every problem of every record with its path, then what the catalogue
// gained. Downloadable as JSON.

const numbers = adminNumberFormat();
const n = (v: unknown) => numbers.format(Number(v) || 0);

export const downloadJson = (data: unknown, name: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};


// how the doctors' fields were matched: what the admin checks before the run
export const Extraction = ({ x }: { x: ExtractionStats }) => {
  const d = x.doctors || 0;
  const items: { label: string; value: string; note?: string }[] = [
    { label: ta("تخصص اصلی"), value: `${n(x.specialityMain)} / ${n(d)}`, note: x.specialityQueued ? ta("${1} نام به صف «ادغام و پاک‌سازی» رفت", [n(x.specialityQueued)]) : x.specialityNew ? ta("${1} تخصص تازه", [n(x.specialityNew)]) : undefined },
    { label: ta("فلوشیپ و فوق تخصص"), value: n(x.fellowships) },
    ...(x.specialitySuggested ? [{ label: ta("تخصص نزدیک (نیازمند انتخاب)"), value: n(x.specialitySuggested) }] : []),
    {
      label: ta("بیماری‌ها"),
      value: ta("${1} تطبیق", [n(x.diseases?.matched)]),
      note: x.diseases?.leftovers
        ? ta("${1} تازه، ${2} پیدانشده", [n(x.diseases?.created), n(x.diseases?.leftovers)])
        : ta("${1} تازه", [n(x.diseases?.created)]),
    },
    {
      label: ta("خدمات"),
      value: ta("${1} تطبیق", [n(x.services?.matched)]),
      note: x.services?.leftovers
        ? ta("${1} تازه، ${2} پیدانشده", [n(x.services?.created), n(x.services?.leftovers)])
        : ta("${1} تازه", [n(x.services?.created)]),
    },
    {
      label: ta("شهر و استان"),
      value: `${n((x.place?.point || 0) + (x.place?.address || 0))} / ${n(d)}`,
      note: ta("نقشه ${1}، نشانی ${2}، ناهمخوان ${3}", [n(x.place?.point), n(x.place?.address), n(x.place?.conflicts)]),
    },
    { label: ta("عکس"), value: `${n(x.photo)} / ${n(d)}` },
  ];
  return (
    <div className={classes.created}>
      <h5 className={classes.subTitle}>{ta("تطبیق فیلدهای پزشکان")}</h5>
      <div className={classes.stats}>
        {items.map((it) => (
          <div key={it.label} className={classes.stat}>
            <span className={classes.fieldMeta}>{it.label}</span>
            <span className={classes.statValue}>{it.value}</span>
            {!!it.note && <span className={classes.fieldMeta}>{it.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

type IssueRow = { id: string; record: ReportRecord; level: string; field: string; message: string; path: string };

const actionColor = (a: ReportRecord["action"]) =>
  a === "create" ? "Success" : a === "update" ? "Info" : a === "fail" ? "Error" : "Secondary";

// `compact`: the partner file's simple screen - the counts, what was added
// to the catalogues and each record's problems
const ImportReportView = ({ report, fileName, compact }: { report: ImportReport; fileName?: string; compact?: boolean }) => {
  const applied = report.mode === "apply";
  const rows = useMemo<IssueRow[]>(
    () =>
      (Array.isArray(report.records) ? report.records : []).flatMap((r, i) =>
        (Array.isArray(r.issues) ? r.issues : []).map((issue, j) => ({
          id: `${i}-${j}`,
          record: r,
          level: issue.level,
          field: issue.field ? fieldLabel(issue.field) : "",
          message: issueText(issue.code, issue.params),
          path: issue.path,
        })),
      ),
    [report.records],
  );
  const failed = (report.records || []).filter((r) => r.action === "fail");
  const placeRows = useMemo(
    () =>
      (Array.isArray(report.records) ? report.records : [])
        .filter((r) => r.kind === "doctor" && (report.extraction || r.place))
        .map((r, i) => ({ id: String(i), name: r.name || "", province: r.place?.province || "—", city: r.place?.city || "—", by: placeByLabel(r.place?.by) || "—" })),
    [report.records, report.extraction],
  );
  const t = report.totals || ({} as ImportReport["totals"]);
  const created = report.created || { specialities: [], tests: [], categories: [] };

  return (
    <div className={classes.report}>
      <div className={classes.reportHead}>
        <h4 className={classes.childTitle}>{applied ? ta("گزارش ورود") : ta("گزارش بررسی (هیچ چیزی ذخیره نشده است)")}</h4>
        <Button
          size="S"
          variant="Neutral"
          onClick={() => downloadJson(report, `${(fileName || "import").replace(/\.json$/i, "")}-${applied ? "report" : "validation"}.json`)}
        >
          {ta("دریافت گزارش (JSON)")}
        </Button>
      </div>
      <div className={classes.badges}>
        <Badge color="Secondary" size="L">{ta("رکوردها: ${1}", [n(t.records)])}</Badge>
        <Badge color="Success" size="L">{`${actionLabel("create", applied)}: ${n(t.create)}`}</Badge>
        <Badge color="Info" size="L">{`${actionLabel("update", applied)}: ${n(t.update)}`}</Badge>
        <Badge color="Secondary" size="L">{`${actionLabel("unchanged", applied)}: ${n(t.unchanged)}`}</Badge>
        <Badge color={t.fail ? "Error" : "Secondary"} size="L">{`${actionLabel("fail", applied)}: ${n(t.fail)}`}</Badge>
        <Badge color={t.warnings ? "Warning" : "Secondary"} size="L">{ta("هشدار: ${1}", [n(t.warnings)])}</Badge>
      </div>
      {!compact && (
        <div className={classes.kindCounts}>
          {Object.entries(report.byKind || {}).map(([kind, c]) => (
            <div key={kind} className={classes.kindCount}>
              <strong>{kindLabel(kind)}</strong>
              <span>
                {ta("${1} رکورد: ${2} جدید، ${3} به‌روز، ${4} بدون تغییر، ${5} ناموفق", [n(c.records), n(c.create), n(c.update), n(c.unchanged), n(c.fail)])}
              </span>
            </div>
          ))}
        </div>
      )}
      {!!report.extraction && <Extraction x={report.extraction} />}
      {(!!created.specialities?.length || !!created.tests?.length || !!created.categories?.length || !!created.diseases?.length || !!created.services?.length) && (
        <div className={classes.created}>
          {!!created.specialities?.length && <p>{ta("تخصص‌های تازه: ${1}", [created.specialities.join("، ")])}</p>}
          {!!created.tests?.length && <p>{ta("آزمایش‌های تازه: ${1}", [created.tests.join("، ")])}</p>}
          {!!created.categories?.length && <p>{ta("دسته‌های تازه: ${1}", [created.categories.join("، ")])}</p>}
          {!!created.diseases?.length && <p>{ta("بیماری‌های تازه (پیش‌نویس): ${1}", [created.diseases.join("، ")])}</p>}
          {!!created.services?.length && <p>{ta("خدمات تازه: ${1}", [created.services.join("، ")])}</p>}
        </div>
      )}
      {!!failed.length && (
        <p className={classes.hint}>
          {applied
            ? ta("رکوردهای ناموفق وارد نشدند؛ بقیه‌ی رکوردها وارد شدند. خطاها را در فایل منبع یا نگاشت درست کنید و دوباره اجرا کنید.")
            : ta("رکوردهای دارای خطا هنگام اعمال کنار گذاشته می‌شوند؛ بقیه وارد می‌شوند.")}
        </p>
      )}
      {!compact && !!placeRows.length && (
        <details className={classes.listBlock}>
          <summary className={classes.listSummary}>{ta("شهر هر رکورد (${1})", [n(placeRows.length)])}</summary>
          <Table
            name="AdminProviderImportPlaces"
            data={placeRows}
            renderer={{
              name: { name: ta("نام"), value: (r) => r.name, filter: "Text" },
              province: { name: ta("استان"), value: (r) => r.province, filter: "Multi" },
              city: { name: ta("شهر"), value: (r) => r.city, filter: "Multi" },
              by: { name: ta("منبع"), value: (r) => r.by, filter: "Multi" },
            }}
          />
        </details>
      )}
      {!!rows.length && (
        <Table
          name="AdminProviderImportIssues"
          data={rows}
          renderer={{
            kind: { name: ta("نوع"), value: (r) => kindLabel(r.record.kind), filter: "Multi" },
            name: { name: ta("نام"), value: (r) => r.record.name || "" , filter: "Text" },
            externalId: { name: ta("شناسه"), value: (r) => r.record.externalId || "", filter: "Text" },
            action: {
              name: ta("نتیجه"),
              value: (r) => actionLabel(r.record.action, applied),
              component: (r) => <Badge color={actionColor(r.record.action)}>{actionLabel(r.record.action, applied)}</Badge>,
              filter: "Multi",
            },
            level: {
              name: ta("سطح"),
              value: (r) => (r.level === "error" ? ta("خطا") : ta("هشدار")),
              component: (r) => <Badge color={r.level === "error" ? "Error" : "Warning"}>{r.level === "error" ? ta("خطا") : ta("هشدار")}</Badge>,
              filter: "Multi",
            },
            path: { name: ta("مسیر"), value: (r) => r.path, filter: "Text" },
            field: { name: ta("فیلد"), value: (r) => r.field, filter: "Multi" },
            message: { name: ta("پیام"), value: (r) => r.message, filter: "Text", width: 420 },
          }}
        />
      )}
    </div>
  );
};

export default ImportReportView;
