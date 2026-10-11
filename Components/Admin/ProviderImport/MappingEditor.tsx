"use client";

import { useMemo, useState } from "react";
import { ta } from "@/Components/Admin/i18n/adminText";
import Badge from "@/Components/UI/Badge";
import { dayLabel, dayValues, enumLabel, fieldLabel, kindLabel, transformLabel, transforms, typeLabel } from "./labels";
import { AnyKind, Catalog, ListMapping, Preview, Rule, SourceList, SourcePath, TargetField, Transform } from "./types";
import classes from "./ProviderImport.module.css";

// The field mapping of one source list (bulk provider import): every field
// of the chosen profile type on one side, how it is read from a source
// record on the other - a field (dot path, with sample values), several
// fields joined, or a constant; then an optional split, simple transforms
// and a value map. Child lists (a doctor's offices, an office's hours) are
// mapped the same way, nested.

const OTHER_LOCALES = ["en", "ar", "zh", "hi", "es", "fr", "ru", "pt", "de", "tr", "ur", "bn", "id", "ja"];
// fields whose values the admin can map one by one (enums and catalogue names)
const VALUE_MAP_FIELDS = new Set(["gender", "type", "sampling", "day", "visitTypes", "mainSpeciality", "specialities", "insurances", "category", "medicalTitle"]);

const nameKey = (s: string) =>
  s
    .replace(/\[\d*\]/g, "")
    .split(".")
    .pop()!
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\s_\-‌]+/g, "")
    .toLowerCase();

// the fields under an object path, as a one-record list (a doctor's `visit`)
export const objectAsList = (source: SourceList, prefix: string): SourceList => ({
  path: prefix,
  count: source.fields.find((f) => f.path === prefix)?.count || 0,
  fields: source.fields.filter((f) => f.path.startsWith(`${prefix}.`)).map((f) => ({ ...f, path: f.path.slice(prefix.length + 1) })),
  children: [],
});

// a first guess for a child list the admin picked by hand: same names
export const guessFields = (fields: TargetField[], source: SourceList): Record<string, Rule> => {
  const out: Record<string, Rule> = {};
  const used = new Set<string>();
  for (const f of fields) {
    const names = [f.key, ...((f as TargetField & { synonyms?: string[] }).synonyms || [])].map(nameKey);
    const hit = source.fields.find((p) => p.type !== "object" && !used.has(p.path) && names.includes(nameKey(p.path)));
    if (hit) {
      used.add(hit.path);
      out[f.key] = { source: hit.path, ...(f.type === "phone" || f.type === "phoneList" ? { transforms: ["phone" as Transform] } : {}) };
    }
  }
  return out;
};

const optionText = (p: SourcePath) => `${p.path}${p.samples.length ? `  —  ${p.samples.join("  |  ")}` : ""}`;

const SourceSelect = ({ value, fields, onChange, label }: { value?: string; fields: SourcePath[]; onChange: (v: string) => void; label: string }) => (
  <select className={classes.select} value={value || ""} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    <option value="">{ta("انتخاب فیلد منبع")}</option>
    {fields.map((p) => (
      <option key={p.path} value={p.path}>
        {optionText(p)}
      </option>
    ))}
    {!!value && !fields.some((p) => p.path === value) && <option value={value}>{value}</option>}
  </select>
);

type Mode = "none" | "field" | "combine" | "constant";
const modeOf = (rule?: Rule): Mode =>
  !rule ? "none" : rule.sources?.length ? "combine" : rule.source ? "field" : rule.constant !== undefined ? "constant" : "field";

const enumOptions = (field: TargetField): { value: string; title: string }[] | null => {
  if (field.type === "enum") return (field.enum || []).map((v) => ({ value: v, title: enumLabel(v) }));
  if (field.type === "boolean") return [{ value: "true", title: ta("بله") }, { value: "false", title: ta("خیر") }];
  if (field.type === "day") return dayValues.map((v, i) => ({ value: v, title: dayLabel(i) }));
  if (field.key === "visitTypes") return ["inPerson", "videoCall", "textChat", "voiceCall"].map((v) => ({ value: v, title: enumLabel(v) }));
  return null;
};

const RuleEditor = ({
  field,
  ruleKey,
  rule,
  fields,
  onChange,
  values,
  names,
}: {
  field: TargetField;
  ruleKey: string;
  rule?: Rule;
  fields: SourcePath[];
  onChange: (rule?: Rule) => void;
  values?: string[];
  names?: Preview["names"][string];
}) => {
  const mode = modeOf(rule);
  const options = enumOptions(field);
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<Rule>) => {
    const next: Rule = { ...(rule || {}), ...patch };
    for (const k of Object.keys(next) as (keyof Rule)[]) if (next[k] === undefined) delete next[k];
    onChange(next);
  };
  const setMode = (m: Mode) => {
    const keep = { transforms: rule?.transforms, split: rule?.split, valueMap: rule?.valueMap };
    if (m === "none") return onChange(undefined);
    if (m === "field") return onChange({ ...keep, source: rule?.source || rule?.sources?.[0] || "" });
    if (m === "combine") return onChange({ ...keep, sources: rule?.sources?.length ? rule.sources : [rule?.source || "", ""], join: rule?.join ?? " " });
    onChange({ ...keep, constant: options?.[0]?.value ?? "" });
  };
  const constantValue = rule?.constant === undefined ? "" : Array.isArray(rule.constant) ? rule.constant.join(", ") : String(rule.constant);
  const extras = (rule?.transforms?.length || 0) + (rule?.split ? 1 : 0) + Object.keys(rule?.valueMap || {}).length;
  const mapValues = VALUE_MAP_FIELDS.has(field.key) && !!values?.length;

  return (
    <div className={classes.rule}>
      <div className={classes.ruleMain}>
        <select className={classes.mode} value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label={ta("روش پر کردن")}>
          <option value="none">{ta("خالی")}</option>
          <option value="field">{ta("از فیلد")}</option>
          <option value="combine">{ta("ترکیب چند فیلد")}</option>
          <option value="constant">{ta("مقدار ثابت")}</option>
        </select>
        {mode === "field" && <SourceSelect label={fieldLabel(ruleKey)} value={rule?.source} fields={fields} onChange={(v) => set({ source: v })} />}
        {mode === "constant" &&
          (options ? (
            <select
              className={classes.select}
              value={constantValue}
              onChange={(e) => set({ constant: field.type === "boolean" ? e.target.value === "true" : e.target.value })}
              aria-label={fieldLabel(ruleKey)}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.title}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={classes.text}
              value={constantValue}
              onChange={(e) => set({ constant: e.target.value })}
              aria-label={fieldLabel(ruleKey)}
            />
          ))}
        {mode !== "none" && mode !== "constant" && (
          <button type="button" className={classes.linkButton} onClick={() => setOpen(!open)} aria-expanded={open}>
            {extras ? ta("تبدیل‌ها (${1})", [extras]) : ta("تبدیل‌ها")}
          </button>
        )}
      </div>
      {mode === "combine" && (
        <div className={classes.combine}>
          {(rule?.sources || []).map((s, i) => (
            <div key={i} className={classes.combineRow}>
              <SourceSelect
                label={fieldLabel(ruleKey)}
                value={s}
                fields={fields}
                onChange={(v) => set({ sources: (rule?.sources || []).map((x, j) => (j === i ? v : x)) })}
              />
              <button
                type="button"
                className={classes.linkButton}
                onClick={() => set({ sources: (rule?.sources || []).filter((_, j) => j !== i) })}
              >
                {ta("حذف")}
              </button>
            </div>
          ))}
          <div className={classes.combineRow}>
            <button type="button" className={classes.linkButton} onClick={() => set({ sources: [...(rule?.sources || []), ""] })}>
              {ta("افزودن فیلد")}
            </button>
            <label className={classes.inline}>
              <span>{ta("جداکننده")}</span>
              <input className={classes.short} value={rule?.join ?? " "} onChange={(e) => set({ join: e.target.value })} />
            </label>
          </div>
        </div>
      )}
      {open && mode !== "none" && mode !== "constant" && (
        <div className={classes.extras}>
          <div className={classes.inlineRow}>
            <label className={classes.inline}>
              <input
                type="checkbox"
                checked={!!rule?.split}
                onChange={(e) => set({ split: e.target.checked ? { by: ",", ...(field.type === "list" ? {} : { index: 0 }) } : undefined })}
              />
              <span>{ta("جدا کردن متن")}</span>
            </label>
            {!!rule?.split && (
              <>
                <label className={classes.inline}>
                  <span>{ta("با")}</span>
                  <input className={classes.short} value={rule.split.by} onChange={(e) => set({ split: { ...rule.split!, by: e.target.value || "," } })} />
                </label>
                <label className={classes.inline}>
                  <span>{ta("بخش شماره")}</span>
                  <select
                    className={classes.short}
                    value={rule.split.index === undefined ? "all" : String(rule.split.index)}
                    onChange={(e) =>
                      set({ split: { by: rule.split!.by, ...(e.target.value === "all" ? {} : { index: Number(e.target.value), rest: rule.split!.rest }) } })
                    }
                  >
                    <option value="all">{ta("همه (فهرست)")}</option>
                    <option value="0">{ta("اول")}</option>
                    <option value="1">{ta("دوم")}</option>
                    <option value="2">{ta("سوم")}</option>
                    <option value="-1">{ta("آخر")}</option>
                  </select>
                </label>
                {rule.split.index !== undefined && (
                  <label className={classes.inline}>
                    <input type="checkbox" checked={!!rule.split.rest} onChange={(e) => set({ split: { ...rule.split!, rest: e.target.checked || undefined } })} />
                    <span>{ta("تا آخر متن")}</span>
                  </label>
                )}
              </>
            )}
          </div>
          <div className={classes.inlineRow}>
            {transforms.map((t) => (
              <label key={t} className={classes.inline}>
                <input
                  type="checkbox"
                  checked={!!rule?.transforms?.includes(t)}
                  onChange={(e) => {
                    const cur = rule?.transforms || [];
                    const next = e.target.checked ? [...cur, t] : cur.filter((x) => x !== t);
                    set({ transforms: next.length ? next : undefined });
                  }}
                />
                <span>{transformLabel(t)}</span>
              </label>
            ))}
          </div>
          {mapValues && (
            <div className={classes.valueMap}>
              <p className={classes.hint}>{ta("مقدارهای این فیلد در فایل؛ برای هر کدام می‌توانید مقدار ما را تعیین کنید (خالی = تشخیص خودکار).")}</p>
              {values!.map((v) => {
                const match = names?.find((n) => n.value === v);
                const current = rule?.valueMap?.[v] ?? "";
                const setOne = (to: string) => {
                  const map = { ...(rule?.valueMap || {}) };
                  if (to) map[v] = to;
                  else delete map[v];
                  set({ valueMap: Object.keys(map).length ? map : undefined });
                };
                return (
                  <div key={v} className={classes.valueRow}>
                    <span className={classes.valueFrom}>{v}</span>
                    <span aria-hidden className={classes.arrow}>→</span>
                    {options ? (
                      <select className={classes.select} value={current} onChange={(e) => setOne(e.target.value)}>
                        <option value="">{ta("خودکار")}</option>
                        {options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input className={classes.text} value={current} placeholder={match?.to || v} onChange={(e) => setOne(e.target.value)} />
                    )}
                    {!!match && !current && (
                      <Badge color={match.match === "existing" ? "Success" : match.match === "new" ? "Info" : "Warning"}>
                        {match.match === "existing"
                          ? ta("در فهرست: ${1}", [match.to || v])
                          : match.match === "new"
                            ? ta("ساخته می‌شود")
                            : ta("پیدا نشد")}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const exampleText = (v: unknown) => (v === undefined || v === "" ? "" : Array.isArray(v) ? v.join("، ") : String(v));

export const ListEditor = ({
  kind,
  source,
  mapping,
  onChange,
  catalog,
  valueKey,
  preview,
}: {
  kind: AnyKind;
  source: SourceList;
  mapping: ListMapping;
  onChange: (m: ListMapping) => void;
  catalog: Catalog;
  valueKey: string;
  preview?: Preview;
}) => {
  const fields = useMemo(() => source.fields.filter((f) => f.type !== "object" || f.path.endsWith("[]")), [source.fields]);
  const setRule = (key: string, rule?: Rule) => {
    const next = { ...mapping.fields };
    if (rule) next[key] = rule;
    else delete next[key];
    onChange({ ...mapping, fields: next });
  };
  const translationKeys = Object.keys(mapping.fields).filter((k) => k.includes("@"));
  const childOptions = [
    ...source.children.map((c) => ({ path: c.path, count: c.count, list: c })),
    ...source.fields
      .filter((f) => f.type === "object" && !f.path.includes("["))
      .map((f) => ({ path: f.path, count: f.count, list: objectAsList(source, f.path) })),
  ];

  return (
    <div className={classes.listEditor}>
      <div className={classes.fieldRows} role="table" aria-label={kindLabel(kind)}>
        {catalog.fields[kind].map((field) => {
          const translated = field.type === "i18n" ? translationKeys.filter((k) => k.startsWith(`${field.key}@`)) : [];
          return (
            <div key={field.key} className={classes.fieldRow} role="row">
              <div className={classes.fieldInfo} role="rowheader">
                <span className={classes.fieldName}>
                  {fieldLabel(field.key)}
                  {field.required && <span className={classes.required}> *</span>}
                </span>
                <span className={classes.fieldMeta}>
                  {typeLabel(field.type)}
                  {field.enum?.length ? `: ${field.enum.map(enumLabel).join("، ")}` : ""}
                </span>
                {!!exampleText(field.example) && (
                  <span className={classes.fieldExample} dir="auto">
                    {ta("نمونه: ${1}", [exampleText(field.example)])}
                  </span>
                )}
              </div>
              <div className={classes.fieldRule} role="cell">
                <RuleEditor
                  field={field}
                  ruleKey={field.key}
                  rule={mapping.fields[field.key]}
                  fields={fields}
                  onChange={(r) => setRule(field.key, r)}
                  values={preview?.values[`${valueKey}:${field.key}`]}
                  names={preview?.names[`${valueKey}:${field.key}`]}
                />
                {translated.map((key) => (
                  <div key={key} className={classes.translationRow}>
                    <Badge color="Secondary">{key.split("@")[1]}</Badge>
                    <SourceSelect label={fieldLabel(key)} value={mapping.fields[key]?.source} fields={fields} onChange={(v) => setRule(key, { source: v })} />
                    <button type="button" className={classes.linkButton} onClick={() => setRule(key, undefined)}>
                      {ta("حذف")}
                    </button>
                  </div>
                ))}
                {field.type === "i18n" && (
                  <select
                    className={classes.addTranslation}
                    value=""
                    onChange={(e) => e.target.value && setRule(`${field.key}@${e.target.value}`, { source: "" })}
                    aria-label={ta("افزودن ترجمه")}
                  >
                    <option value="">{ta("+ ترجمه از فیلد دیگر")}</option>
                    {OTHER_LOCALES.filter((l) => !translated.includes(`${field.key}@${l}`)).map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {catalog.children[kind].map((spec) => {
        const childIndex = (mapping.children || []).findIndex((c) => c.kind === spec.kind);
        const child = childIndex === -1 ? undefined : mapping.children![childIndex];
        const option = child ? childOptions.find((o) => o.path === child.path) : undefined;
        const setChild = (next?: ListMapping) => {
          const list = [...(mapping.children || [])].filter((c) => c.kind !== spec.kind);
          onChange({ ...mapping, children: next ? [...list, next] : list });
        };
        return (
          <section key={spec.key} className={classes.child}>
            <div className={classes.childHead}>
              <h4 className={classes.childTitle}>{kindLabel(spec.kind)}</h4>
              <select
                className={classes.select}
                value={child?.path || ""}
                onChange={(e) => {
                  const path = e.target.value;
                  if (!path) return setChild(undefined);
                  const opt = childOptions.find((o) => o.path === path);
                  setChild({ path, kind: spec.kind, fields: opt ? guessFields(catalog.fields[spec.kind], opt.list) : {}, children: [] });
                }}
                aria-label={kindLabel(spec.kind)}
              >
                <option value="">{ta("ندارد")}</option>
                {childOptions.map((o) => (
                  <option key={o.path} value={o.path}>
                    {`${o.path} (${o.count})`}
                  </option>
                ))}
              </select>
            </div>
            {!!child && (
              <ListEditor
                kind={spec.kind}
                source={option?.list || { path: child.path, count: 0, fields: [], children: [] }}
                mapping={child}
                onChange={(m) => setChild(m)}
                catalog={catalog}
                valueKey={`${valueKey}.${childIndex}`}
                preview={preview}
              />
            )}
          </section>
        );
      })}
    </div>
  );
};
