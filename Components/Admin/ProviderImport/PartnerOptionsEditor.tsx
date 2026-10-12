"use client";

import { useEffect, useState } from "react";
import { ta } from "@/Components/Admin/i18n/adminText";
import { MappingOptions } from "./types";
import classes from "./ProviderImport.module.css";

// The mapping's partner options (bulk provider import, backend
// Lib/providerImport/mapping.ts `options`): where the file comes from (kept
// on every imported record for traceability), the phrases and headings the
// introduction clean-up removes, and the partner's category slugs that
// point to our specialities. A built-in template (DrDr) ships them; the
// admin edits them here and saves the template as usual.

const lines = (v?: string[]) => (v || []).join("\n");
const toList = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const hintsText = (h?: Record<string, string>) =>
  Object.entries(h || {})
    .map(([k, v]) => `${k} = ${v}`)
    .join("\n");
const toHints = (text: string) => {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const [k, ...rest] = line.split("=");
    const v = rest.join("=").trim();
    if (k?.trim() && v) out[k.trim()] = v;
  }
  return out;
};

// a textarea edited as text, sent up as a list when it loses focus
const Area = ({ label, hint, value, onCommit, dir }: { label: string; hint: string; value: string; onCommit: (text: string) => void; dir?: "ltr" | "auto" }) => {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label className={classes.optionBox}>
      <span className={classes.fieldName}>{label}</span>
      <span className={classes.fieldMeta}>{hint}</span>
      <textarea className={classes.optionArea} dir={dir || "auto"} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== value && onCommit(text)} />
    </label>
  );
};

const PartnerOptionsEditor = ({ options, onChange }: { options: MappingOptions; onChange: (o: MappingOptions) => void }) => {
  const bio = options.bio || {};
  const setBio = (patch: Partial<NonNullable<MappingOptions["bio"]>>) => onChange({ ...options, bio: { ...bio, ...patch } });
  const source = options.source;
  return (
    <details className={classes.listBlock}>
      <summary className={classes.listSummary}>
        <span>{ta("منبع و پاک‌سازی معرفی")}</span>
        {!!source?.label && <span className={classes.fieldMeta}>{source.label}</span>}
      </summary>
      <div className={classes.listEditor}>
        {!!source && (
          <p className={classes.hint}>
            {ta("هر رکورد با نام منبع «${1}»، شماره‌ی قرارداد و تاریخ تولید فایل ثبت می‌شود (فقط برای پیگیری؛ در سایت نمایش داده نمی‌شود).", [source.label || source.key])}
          </p>
        )}
        <div className={classes.options}>
          <Area
            label={ta("جمله‌های حذف‌شدنی")}
            hint={ta("هر جمله‌ی معرفی که یکی از این عبارت‌ها را داشته باشد حذف می‌شود (یک عبارت در هر خط)")}
            value={lines(bio.dropPhrases)}
            onCommit={(t) => setBio({ dropPhrases: toList(t) })}
          />
          <Area
            label={ta("بخش‌های حذف‌شدنی")}
            hint={ta("از این عنوان تا عنوان بعدی حذف می‌شود؛ مثل نظرات، نشانی، ساعت کاری و نوبت‌دهی که فیلد جدا دارند")}
            value={lines(bio.dropSections)}
            onCommit={(t) => setBio({ dropSections: toList(t) })}
          />
          <Area
            label={ta("عنوان بخش‌های ماندنی")}
            hint={ta("فقط مرز بخش‌ها را نشان می‌دهند (سوابق، خدمات، تحصیلات)")}
            value={lines(bio.keepSections)}
            onCommit={(t) => setBio({ keepSections: toList(t) })}
          />
          <Area
            label={ta("نامک دسته‌ی منبع = تخصص ما")}
            hint={ta("وقتی عنوان تخصص فقط فلوشیپ را می‌گوید، تخصص اصلی از دسته‌ی منبع خوانده می‌شود (یک جفت در هر خط)")}
            value={hintsText(options.specialityHints)}
            onCommit={(t) => onChange({ ...options, specialityHints: toHints(t) })}
          />
        </div>
      </div>
    </details>
  );
};

export default PartnerOptionsEditor;
