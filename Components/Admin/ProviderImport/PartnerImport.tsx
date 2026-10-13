"use client";

import { ReactNode } from "react";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import Box from "@/Components/Admin/UI/Box";
import { destinationLabel } from "./labels";
import { Template } from "./types";
import classes from "./ProviderImport.module.css";

// A recognised partner file (DrDr): one simple screen instead of the field
// mapper. Each field of the partner's record goes straight to one place on
// the doctor's profile (the read-only table, from the backend's built-in
// template), then «بررسی» (dry run) and «اعمال». Nothing else of the file
// is read or kept - not its metadata, not the profile links. «تنظیمات
// پیشرفته» opens the generic mapper with the same template.
//
// Benchmark: Doctolib / Docplanner take a partner's practice list through a
// fixed column template their ops team runs, not a mapping UI; NoyanAI does
// the same for a contracted directory and keeps the generic mapper only for
// one-off files.

const numbers = adminNumberFormat();

type Props = {
  template: Template;
  count: number;
  validated: boolean;
  starting: boolean;
  running: boolean;
  applying: boolean;
  done: boolean;
  onValidate: () => void;
  onApply: () => void;
  onAdvanced: () => void;
  children?: ReactNode;
};

const PartnerImport = ({ template, count, validated, starting, running, applying, done, onValidate, onApply, onAdvanced, children }: Props) => {
  const fields = Array.isArray(template.fields) ? template.fields : [];
  const canApply = validated && !running;
  // a centres file (DrDr's pharmacies) talks about centres, not doctors
  const doctors = (template.mapping?.lists?.[0]?.kind || "doctor") === "doctor";
  return (
    <Box className={classes.section}>
      <h3 className={classes.sectionTitle}>{ta("فایل «${1}» شناخته شد", [template.name])}</h3>
      <p className={classes.hint}>
        {doctors
          ? ta("هر فیلد فایل مستقیم به یک جای پروفایل پزشک می‌رود و چیز دیگری از فایل خوانده یا نگه داشته نمی‌شود. اجرای دوباره‌ی همین فایل یا فایل بعدی، همان پزشک را به‌روز می‌کند و پزشک تکراری نمی‌سازد؛ پروفایلی که صاحبش آن را ادعا کرده فقط در فیلدهای خالی پر می‌شود.")
          : ta("هر فیلد فایل مستقیم به یک جای پروفایل مرکز می‌رود و چیز دیگری از فایل خوانده یا نگه داشته نمی‌شود. اجرای دوباره‌ی همین فایل، همان مرکز را به‌روز می‌کند و مرکز تکراری نمی‌سازد.")}
      </p>
      <table className={classes.fieldMap}>
        <thead>
          <tr>
            <th scope="col">{ta("فیلد فایل")}</th>
            <th scope="col">{ta("محل در پروفایل")}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.source} className={f.to === "ignored" ? classes.fieldMapIgnored : undefined}>
              <td dir="auto">
                <span className={classes.fieldMapSource}>{f.source}</span>
              </td>
              <td>{destinationLabel(f.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={classes.fileLine}>
        <strong>{doctors ? ta("${1} پزشک در فایل", [numbers.format(count)]) : ta("${1} مرکز در فایل", [numbers.format(count)])}</strong>
      </p>
      <div className={classes.actionsRow}>
        <Button size="M" variant="Neutral" isLoading={starting && !validated} onClick={running ? undefined : onValidate}>
          {ta("بررسی")}
        </Button>
        <Button size="M" variant={canApply ? "Primary" : "Disable"} isLoading={applying} onClick={canApply ? onApply : undefined}>
          {ta("اعمال")}
        </Button>
        {!validated && !done && <span className={classes.fieldMeta}>{ta("پیش از اعمال، فایل را بررسی کنید.")}</span>}
        <button type="button" className={classes.linkButton} onClick={onAdvanced}>
          {ta("تنظیمات پیشرفته")}
        </button>
      </div>
      {children}
    </Box>
  );
};

export default PartnerImport;
