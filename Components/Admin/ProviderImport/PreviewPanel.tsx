"use client";

import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Badge from "@/Components/UI/Badge";
import { dayLabel, enumLabel, fieldLabel, issueText, kindLabel } from "./labels";
import { Issue, Preview, PreviewRecord } from "./types";
import classes from "./ProviderImport.module.css";

// The first records of each mapped list, as they would become our profiles
// (bulk provider import): updated as the admin maps, with each record's
// problems next to it.

const numbers = adminNumberFormat();
const time = (m: unknown) => {
  const n = Number(m);
  if (!Number.isFinite(n)) return "";
  const h = Math.floor(n / 60) % 25;
  return `${String(h).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
};
// a percent-encoded link as people read it
const readableUrl = (v: unknown) => {
  try {
    return decodeURI(String(v ?? ""));
  } catch {
    return String(v ?? "");
  }
};
const text = (v: unknown) => (Array.isArray(v) ? v.map(String).join("، ") : v === undefined || v === null ? "" : typeof v === "object" ? "" : String(v));

export const IssueList = ({ issues }: { issues: Issue[] }) =>
  !issues.length ? null : (
    <ul className={classes.issues}>
      {issues.map((i, n) => (
        <li key={n} className={i.level === "error" ? classes.issueError : classes.issueWarning}>
          <Badge color={i.level === "error" ? "Error" : "Warning"}>{i.level === "error" ? ta("خطا") : ta("هشدار")}</Badge>
          {!!i.field && <strong>{fieldLabel(i.field)}:</strong>}
          <span>{issueText(i.code, i.params)}</span>
          <span className={classes.path} dir="ltr">
            {i.path}
          </span>
        </li>
      ))}
    </ul>
  );

const Hours = ({ rows }: { rows?: PreviewRecord[] }) =>
  !rows?.length ? null : (
    <ul className={classes.hours}>
      {rows.map((r, i) => {
        const days = (r.data.day as number[] | undefined) || [];
        const ranges = (r.data.ranges as { from: number; to: number }[] | undefined) || [];
        return (
          <li key={i}>
            <span>{days.map(dayLabel).join("، ") || "—"}</span>
            <span dir="ltr">{ranges.map((x) => `${time(x.from)}-${time(x.to)}`).join(", ") || "—"}</span>
            {!!(r.data.visitTypes as string[] | undefined)?.length && (
              <span>{(r.data.visitTypes as string[]).map(enumLabel).join("، ")}</span>
            )}
          </li>
        );
      })}
    </ul>
  );

const Line = ({ label, value }: { label: string; value: unknown }) => {
  const v = text(value);
  if (!v) return null;
  return (
    <div className={classes.line}>
      <span className={classes.lineLabel}>{label}</span>
      <span dir="auto" className={v.length > 300 ? classes.lineLong : undefined}>
        {v}
      </span>
    </div>
  );
};

const titleOf = (r: PreviewRecord) =>
  text(r.data.firstName || r.data.lastName ? `${text(r.data.firstName)} ${text(r.data.lastName)}` : r.data.name || r.data.address) || ta("بدون نام");

const SKIP = new Set(["firstName", "lastName", "name", "externalId", "ranges", "day", "visitTypes", "hoursRows"]);
// shown resolved against the catalogues instead of as written
const RESOLVED = new Set(["mainSpeciality", "specialities", "services", "diseases"]);

// the hours read out of the text (backend parseHoursText)
const TextHours = ({ rows }: { rows?: unknown }) =>
  !Array.isArray(rows) || !rows.length ? null : (
    <ul className={classes.hours}>
      {(rows as { days?: number[]; from?: number; to?: number }[]).map((r, i) => (
        <li key={i}>
          <span>{(r.days || []).map(dayLabel).join("، ") || "—"}</span>
          <span dir="ltr">{`${time(r.from)}-${time(r.to)}`}</span>
        </li>
      ))}
    </ul>
  );

const Resolved = ({ record }: { record: PreviewRecord }) => {
  const r = record.resolved;
  if (!r) return null;
  const list = (x?: { matched: string[]; create: string[]; unknown: string[] }) =>
    !x
      ? ""
      : [
          x.matched.join("، "),
          x.create.length ? ta("تازه: ${1}", [x.create.join("، ")]) : "",
          x.unknown.length ? ta("پیدانشده: ${1}", [x.unknown.join("، ")]) : "",
        ]
          .filter(Boolean)
          .join(" · ");
  return (
    <>
      <Line label={fieldLabel("mainSpeciality")} value={r.mainSpeciality} />
      <Line label={fieldLabel("specialities")} value={r.specialities} />
      <Line label={fieldLabel("diseases")} value={list(r.diseases)} />
      <Line label={fieldLabel("services")} value={list(r.services)} />
    </>
  );
};

const RecordCard = ({ record, kind }: { record: PreviewRecord; kind: string }) => {
  const errors = record.issues.some((i) => i.level === "error");
  const point = record.data.lat !== undefined ? `${record.data.lat}, ${record.data.lng}` : "";
  return (
    <article className={`${classes.card} ${errors ? classes.cardError : ""}`}>
      <header className={classes.cardHead}>
        <h4 className={classes.cardTitle} dir="auto">
          {kind === "doctor" ? ta("دکتر ${1}", [titleOf(record)]) : titleOf(record)}
        </h4>
        {!!record.externalId && (
          <span className={classes.path} dir="ltr">
            {record.externalId}
          </span>
        )}
        <Badge color={errors ? "Error" : "Success"}>{errors ? ta("وارد نمی‌شود") : ta("آماده")}</Badge>
      </header>
      <div className={classes.lines}>
        {Object.entries(record.data)
          .filter(([k]) => !SKIP.has(k) && k !== "lat" && k !== "lng" && !(record.resolved && RESOLVED.has(k)))
          .map(([k, v]) => (
            <Line
              key={k}
              label={fieldLabel(k)}
              value={k === "gender" || k === "type" || k === "sampling" ? enumLabel(String(v)) : k === "price" ? numbers.format(Number(v)) : k === "sourceUrl" || k === "photo" ? readableUrl(v) : v}
            />
          ))}
        <Resolved record={record} />
        {!!point && <Line label={ta("روی نقشه")} value={point} />}
        {Object.entries(record.translations || {}).map(([loc, bag]) => (
          <Line key={loc} label={ta("ترجمه (${1})", [loc])} value={Object.values(bag).map(text).join(" / ")} />
        ))}
      </div>
      {(record.children.visitTypes || []).length > 0 && (
        <div className={classes.sub}>
          <h5 className={classes.subTitle}>{kindLabel("visitType")}</h5>
          <ul className={classes.chips}>
            {record.children.visitTypes.map((v, i) => (
              <li key={i}>
                {`${enumLabel(text(v.data.type))}: ${v.data.price !== undefined ? numbers.format(Number(v.data.price)) : "—"} ${ta("تومان")}`}
                {v.data.duration !== undefined ? ` · ${ta("${1} دقیقه", [text(v.data.duration)])}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(record.children.tests || []).length > 0 && (
        <div className={classes.sub}>
          <h5 className={classes.subTitle}>{kindLabel("labTest")}</h5>
          <ul className={classes.chips}>
            {record.children.tests.map((t, i) => (
              <li key={i}>{`${text(t.data.name)}: ${t.data.price !== undefined ? numbers.format(Number(t.data.price)) : "—"} ${ta("تومان")}`}</li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(record.data.hoursRows) && !!record.data.hoursRows.length && (
        <div className={classes.sub}>
          <h5 className={classes.subTitle}>{ta("ساعت کاری خوانده‌شده از متن")}</h5>
          <TextHours rows={record.data.hoursRows} />
        </div>
      )}
      {!!record.children.hours?.length && (
        <div className={classes.sub}>
          <h5 className={classes.subTitle}>{kindLabel("hours")}</h5>
          <Hours rows={record.children.hours} />
        </div>
      )}
      {(record.children.offices || []).map((o, i) => (
        <div key={i} className={classes.sub}>
          <h5 className={classes.subTitle} dir="auto">
            {text(o.data.name) || ta("مطب ${1}", [i + 1])}
          </h5>
          <Line label={fieldLabel("address")} value={o.data.address} />
          <Line label={fieldLabel("phone")} value={o.data.phone} />
          <Line label={ta("روی نقشه")} value={o.data.lat !== undefined ? `${o.data.lat}, ${o.data.lng}` : ""} />
          <Line label={fieldLabel("centre")} value={o.data.centre} />
          <Hours rows={o.children.hours} />
        </div>
      ))}
      <IssueList issues={record.issues} />
    </article>
  );
};

const PreviewPanel = ({ preview, loading }: { preview?: Preview; loading: boolean }) => {
  if (!preview) return <p className={classes.hint}>{loading ? ta("در حال ساخت پیش‌نمایش…") : ta("پس از انتخاب فهرست‌ها پیش‌نمایش این‌جا نشان داده می‌شود.")}</p>;
  return (
    <div className={classes.previewLists} aria-busy={loading}>
      {preview.lists.map((list) => (
        <section key={list.listIndex} className={classes.previewList}>
          <h4 className={classes.childTitle}>
            {ta("${1}: ${2} رکورد اول از ${3}", [kindLabel(list.kind), list.records.length, numbers.format(list.total)])}
          </h4>
          <div className={classes.cards}>
            {list.records.map((r, i) => (
              <RecordCard key={i} record={r} kind={list.kind} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PreviewPanel;
