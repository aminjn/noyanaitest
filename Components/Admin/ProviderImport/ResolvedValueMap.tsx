"use client";

import { useMemo, useState } from "react";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import { NameRow } from "./types";
import classes from "./ProviderImport.module.css";

// The value-map step of a field resolved against our catalogues (bulk
// provider import, backend Services/providerImportResolve.ts): every
// speciality, condition or service name the file holds, what it resolves
// to, and the admin's choice for the ones that did not resolve - use the
// suggested entry, create a new one, map it by hand (several names split
// with «|»), or leave it out. Nothing is created unless chosen here, except
// a speciality with nothing near it in the catalogue (listed as «ساخته
// می‌شود»).

export const CREATE = "__create__";
export const SKIP = "__skip__";
const MANUAL = "__manual__";
const SUGGEST = "__suggest__";

const numbers = adminNumberFormat();

const statusBadge = (row: NameRow) => {
  switch (row.match) {
    case "existing":
      return <Badge color="Success">{ta("در فهرست: ${1}", [row.to || row.value])}</Badge>;
    case "new":
    case "create":
      return <Badge color="Info">{ta("ساخته می‌شود")}</Badge>;
    case "suggest":
      return <Badge color="Warning">{ta("نزدیک به «${1}»", [row.suggestion || ""])}</Badge>;
    case "skip":
      return <Badge color="Secondary">{ta("کنار گذاشته می‌شود")}</Badge>;
    default:
      return <Badge color="Warning">{ta("پیدا نشد")}</Badge>;
  }
};

const ResolvedValueMap = ({
  field,
  rows,
  valueMap,
  onChange,
  aiSplit,
}: {
  field: string;
  rows: NameRow[];
  valueMap?: Record<string, string>;
  onChange: (map?: Record<string, string>) => void;
  aiSplit?: (field: string, chunks: string[]) => Promise<Record<string, string[]>>;
}) => {
  const pushNotification = useNotification();
  const [showAll, setShowAll] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const map = useMemo(() => valueMap || {}, [valueMap]);
  const open = rows.filter((r) => r.match !== "existing" || map[r.value] !== undefined);
  const shown = showAll ? rows : open;
  const isList = field === "services" || field === "diseases";
  const undecided = rows.filter((r) => (r.match === "unknown" || r.match === "suggest") && map[r.value] === undefined);

  const setMany = (patch: Record<string, string | undefined>) => {
    const next = { ...map };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") delete next[k];
      else next[k] = v;
    }
    onChange(Object.keys(next).length ? next : undefined);
  };

  const runAi = async () => {
    if (!aiSplit) return;
    setSplitting(true);
    try {
      const chunks = undecided.filter((r) => r.match === "unknown").map((r) => r.value);
      const result = await aiSplit(field, chunks);
      const patch: Record<string, string> = {};
      for (const [chunk, names] of Object.entries(result || {})) if (Array.isArray(names) && names.length > 1) patch[chunk] = names.join(" | ");
      if (!Object.keys(patch).length) pushNotification(ta("هوش مصنوعی جداسازی تازه‌ای پیشنهاد نکرد"), "Notify");
      else {
        setManual((m) => ({ ...m, ...Object.fromEntries(Object.keys(patch).map((k) => [k, true])) }));
        setMany(patch);
      }
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSplitting(false);
    }
  };

  if (!rows.length) return null;
  return (
    <div className={classes.valueMap}>
      <p className={classes.hint}>
        {field === "insurances"
          ? ta("بیمه‌هایی از فهرست بیمه‌ها که در متن پیدا شدند؛ بیمه‌ای که در فهرست نباشد شناخته نمی‌شود.")
          : isList
          ? ta("نام‌هایی که در کاتالوگ پیدا نشدند. هیچ‌کدام بی‌اجازه ساخته نمی‌شود: بسازید، به موردی موجود وصل کنید یا دستی جدا کنید (چند نام با «|»؛ نامی که در کاتالوگ نباشد ساخته می‌شود)، یا کنار بگذارید.")
          : ta("تخصص‌های فایل و تطبیق آن‌ها با فهرست تخصص‌ها. تخصص نزدیک فقط پیشنهاد می‌شود و تا انتخاب نکنید به کار نمی‌رود.")}
      </p>
      <div className={classes.valueMapActions}>
        {!!undecided.length && (
          <>
            <Button size="S" variant="Neutral" onClick={() => setMany(Object.fromEntries(undecided.map((r) => [r.value, CREATE])))}>
              {ta("ساخت همه‌ی موارد پیدانشده (${1})", [numbers.format(undecided.length)])}
            </Button>
            <Button size="S" variant="Neutral" onClick={() => setMany(Object.fromEntries(undecided.map((r) => [r.value, SKIP])))}>
              {ta("کنار گذاشتن همه")}
            </Button>
          </>
        )}
        {isList && !!aiSplit && undecided.some((r) => r.match === "unknown") && (
          <Button size="S" variant="Neutral" isLoading={splitting} onClick={runAi}>
            {ta("پیشنهاد جداسازی با هوش مصنوعی")}
          </Button>
        )}
        <button type="button" className={classes.linkButton} onClick={() => setShowAll(!showAll)}>
          {showAll ? ta("فقط موارد نیازمند تصمیم") : ta("نمایش همه (${1})", [numbers.format(rows.length)])}
        </button>
      </div>
      {!shown.length && <p className={classes.hint}>{ta("همه‌ی نام‌ها در کاتالوگ پیدا شدند.")}</p>}
      {shown.map((row) => {
        const current = map[row.value];
        const mode =
          current === undefined
            ? ""
            : current === CREATE
              ? CREATE
              : current === SKIP
                ? SKIP
                : row.suggestion && current === row.suggestion && !manual[row.value]
                  ? SUGGEST
                  : MANUAL;
        return (
          <div key={row.value} className={classes.valueRow}>
            <span className={classes.valueFrom} dir="auto">
              {row.value}
            </span>
            {!!row.count && row.count > 1 && <span className={classes.fieldMeta}>{`×${numbers.format(row.count)}`}</span>}
            {current === undefined && statusBadge(row)}
            <select
              className={classes.select}
              value={mode}
              aria-label={ta("تصمیم برای «${1}»", [row.value])}
              onChange={(e) => {
                const v = e.target.value;
                setManual((m) => ({ ...m, [row.value]: v === MANUAL }));
                setMany({ [row.value]: v === "" ? undefined : v === SUGGEST ? row.suggestion : v === MANUAL ? current && current !== CREATE && current !== SKIP ? current : row.value : v });
              }}
            >
              <option value="">{ta("خودکار")}</option>
              {!!row.suggestion && <option value={SUGGEST}>{ta("استفاده از «${1}»", [row.suggestion])}</option>}
              <option value={CREATE}>{ta("ساخت تازه")}</option>
              <option value={MANUAL}>{isList ? ta("وصل یا جدا کردن دستی") : ta("وصل به تخصص دیگر")}</option>
              <option value={SKIP}>{ta("کنار گذاشتن")}</option>
            </select>
            {mode === MANUAL && (
              <input
                className={classes.text}
                value={current || ""}
                dir="auto"
                placeholder={isList ? ta("نام موجود، یا چند نام با «|»") : ta("نام تخصص در فهرست")}
                aria-label={ta("مقدار برای «${1}»", [row.value])}
                onChange={(e) => setMany({ [row.value]: e.target.value || row.value })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResolvedValueMap;
