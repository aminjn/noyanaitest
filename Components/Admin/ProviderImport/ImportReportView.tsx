"use client";

import { useMemo } from "react";
import { adminIntlTag, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
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

const pct = (part: number, whole: number) => (whole ? `${n(Math.round((part / whole) * 100))}٪` : "");

// what was read out of a partner's free text: the accuracy the admin checks
// before running the import
const Extraction = ({ x }: { x: ExtractionStats }) => {
  const d = x.doctors || 0;
  const items: { label: string; value: string; note?: string }[] = [
    { label: ta("شماره نظام پزشکی"), value: `${n(x.medicalCode)} / ${n(d)}`, note: pct(x.medicalCode, d) },
    { label: ta("تخصص اصلی"), value: `${n(x.specialityMain)} / ${n(d)}`, note: x.specialityByHint ? ta("${1} از دسته‌ی منبع", [n(x.specialityByHint)]) : undefined },
    { label: ta("فلوشیپ و فوق تخصص"), value: n(x.fellowships), note: x.specialityNew ? ta("${1} تخصص تازه", [n(x.specialityNew)]) : undefined },
    { label: ta("تخصص نزدیک (نیازمند انتخاب)"), value: n(x.specialitySuggested) },
    { label: ta("ساعت کاری"), value: `${n(x.hours)} / ${n(d)}`, note: x.hoursUnread ? ta("${1} خوانده نشد", [n(x.hoursUnread)]) : undefined },
    { label: ta("بیمه‌های طرف قرارداد"), value: `${n(x.insurers)} / ${n(d)}`, note: ta("${1} پیوند بیمه", [n(x.insurerLinks)]) },
    {
      label: ta("بیماری‌ها"),
      value: ta("${1} تطبیق", [n(x.diseases?.matched)]),
      note: ta("${1} تازه، ${2} پیدانشده", [n(x.diseases?.created), n(x.diseases?.leftovers)]),
    },
    {
      label: ta("خدمات"),
      value: ta("${1} تطبیق", [n(x.services?.matched)]),
      note: ta("${1} تازه، ${2} پیدانشده", [n(x.services?.created), n(x.services?.leftovers)]),
    },
    {
      label: ta("شهر و استان"),
      value: `${n((x.place?.point || 0) + (x.place?.address || 0) + (x.place?.section || 0))} / ${n(d)}`,
      note: ta("نقشه ${1}، نشانی ${2}، عنوان فایل ${3}، ناهمخوان ${4}", [n(x.place?.point), n(x.place?.address), n(x.place?.section), n(x.place?.conflicts)]),
    },
    { label: ta("اینستاگرام"), value: n(x.instagram) },
    { label: ta("عکس"), value: `${n(x.photo)} / ${n(d)}` },
    {
      label: ta("پاک‌سازی معرفی"),
      value: ta("${1} نویسه از ${2}", [n(x.bio?.charsAfter), n(x.bio?.charsBefore)]),
      note: pct(x.bio?.charsAfter || 0, x.bio?.charsBefore || 0),
    },
  ];
  return (
    <div className={classes.created}>
      <h5 className={classes.subTitle}>{ta("آنچه از متن‌های منبع خوانده شد")}</h5>
      <div className={classes.stats}>
        {items.map((it) => (
          <div key={it.label} className={classes.stat}>
            <span className={classes.fieldMeta}>{it.label}</span>
            <span className={classes.statValue}>{it.value}</span>
            {!!it.note && <span className={classes.fieldMeta}>{it.note}</span>}
          </div>
        ))}
      </div>
      {!!x.section?.city && (
        <p className={classes.hint}>
          {ta("عنوان فایل شهر «${1}» را می‌گوید اما ${2} پزشک جای دیگری هستند و ${3} پزشک در همین شهر؛ شهر هر پزشک از نقشه یا نشانی خودش گرفته شد.", [x.section.city, n(x.section.elsewhere), n(x.section.matching)])}
        </p>
      )}
    </div>
  );
};

type IssueRow = { id: string; record: ReportRecord; level: string; field: string; message: string; path: string };

const actionColor = (a: ReportRecord["action"]) =>
  a === "create" ? "Success" : a === "update" ? "Info" : a === "fail" ? "Error" : "Secondary";

const ImportReportView = ({ report, fileName }: { report: ImportReport; fileName?: string }) => {
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
      {!!report.source && (
        <p className={classes.hint}>
          {ta("منبع: ${1}، قرارداد ${2}، تاریخ فایل ${3}", [
            report.source.key,
            report.source.contractRef || "-",
            report.source.generatedAt && !Number.isNaN(Date.parse(report.source.generatedAt))
              ? new Date(report.source.generatedAt).toLocaleString(adminIntlTag(), { timeZone: TEHRAN_TZ, dateStyle: "medium", timeStyle: "short" })
              : report.source.generatedAt || "-",
          ])}
        </p>
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
      {!!placeRows.length && (
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
