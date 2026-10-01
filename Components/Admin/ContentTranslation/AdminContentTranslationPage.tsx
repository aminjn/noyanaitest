"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "@/Components/i18n/Link";
import useSWR from "swr";
import classes from "./AdminContentTranslations.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import useNotification from "@/Components/Hooks/useNotification";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import Button from "@/Components/UI/Button";
import RenderRtf from "@/Components/UI/RenderRtf";
import RTFEditor from "@/Components/UI/RTFEditor/RTFEditor";
import StringListInput from "@/Components/UI/StringListInput";
import HandleLoading from "../UI/HandleLoading";
import { Locale, localeDir, localeNames } from "@/Components/i18n/locales";
import { FieldKind, fieldTitles, isRtf, segmentTitle } from "./segments";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

type Value = string | string[];

type RecordData = {
  fields: Record<string, FieldKind>;
  source: Record<string, Value | undefined>;
  translations: Partial<Record<Locale, Record<string, unknown>>>;
  stale: Partial<Record<Locale, string[]>>;
  machine: boolean;
};

const targetLocales = (Object.keys(localeNames) as Locale[]).filter((l) => l !== "fa");

const hasText = (value: unknown) =>
  Array.isArray(value)
    ? value.some((v) => typeof v === "string" && v.trim())
    : typeof value === "string" && value.trim() !== "";

// `segment` given: shown as the "ترجمه‌ها" tab of that record's own admin
// page (2026-09 audit - translating used to need a separate page no editor
// linked to); the record id comes from that page's URL.
const AdminContentTranslationPage = ({ segment }: { segment?: string } = {}) => {
  const routeParams = useParams<{ segment: string; nodeId: string }>();
  const params =
    segment && routeParams?.nodeId
      ? { segment, nodeId: routeParams.nodeId }
      : routeParams;
  const embedded = !!segment;
  const pushNotification = useNotification();
  const [locale, setLocale] = useState<Locale>("en");
  const [values, setValues] = useState<Record<string, Value>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<"one" | "all" | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  // Remounts the RTF editors after a save / machine translation.
  const [revision, setRevision] = useState(0);

  const url = params ? `${API}/auto/${params.segment}/${params.nodeId}/_translations` : null;
  const { data, error, mutate } = useSWR<RecordData>(url, (u: string) =>
    fetcher({ url: u }).then((res) => res.data),
  );

  // Fields that have Persian text - the rest have nothing to translate.
  const fields = useMemo(
    () =>
      data
        ? (Object.entries(data.fields) as [string, FieldKind][]).filter(([f]) =>
            hasText(data.source[f]),
          )
        : [],
    [data],
  );

  useEffect(() => {
    if (!data) return;
    const bag = data.translations[locale] || {};
    setValues(
      Object.fromEntries(
        fields.map(([f, kind]) => [
          f,
          (bag[f] as Value | undefined) ?? (kind === "list" ? [] : ""),
        ]),
      ),
    );
    setDirty(false);
  }, [data, locale, fields]);

  const progress = (l: Locale) => {
    const bag = data?.translations[l] || {};
    return fields.filter(([f]) => hasText(bag[f])).length;
  };

  const change = (field: string, value: Value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const save = async () => {
    if (!url) return;
    setSaving(true);
    try {
      await fetcher({ url, method: "POST", payload: { locale, values } });
      pushNotification(ta("ترجمه ذخیره شد"), "Success");
      await mutate();
      setRevision((r) => r + 1);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  const machineTranslate = async (scope: "one" | "all") => {
    if (!url) return;
    setTranslating(scope);
    try {
      const res = await fetcher<{ data: { written: number } }>({
        url: `${url}/auto`,
        method: "POST",
        payload: { locales: scope === "one" ? [locale] : targetLocales, overwrite },
      });
      const written = res.data?.written ?? 0;
      pushNotification(
        written ? ta("${1} فیلد ترجمه شد", [written.toLocaleString(adminIntlTag())]) : ta("فیلد خالی برای ترجمه نبود"),
        "Success",
      );
      await mutate();
      setRevision((r) => r + 1);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setTranslating(null);
    }
  };

  const stale = new Set(data?.stale[locale] || []);
  const dir = localeDir(locale);

  return (
    <HandleLoading data={!!data} error={error}>
      {data && params && (
        <div className={classes.main}>
          {!embedded && (
            <Link href={adminPath("/localization?tab=content")} className={classes.back}>
              <Ixon width="1rem" style={{ transform: "rotateZ(-90deg)" }}>
                <ChevronIcon />
              </Ixon>
              <span>{ta("ترجمه محتوا")}</span>
            </Link>
          )}

          {!embedded && (
          <header className={classes.header}>
            <h1 className={classes.title}>
              {(() => {
                const label = fields.find(([, kind]) => kind === "line")?.[0];
                const value = label ? data.source[label] : undefined;
                return typeof value === "string" ? value : segmentTitle(params.segment);
              })()}
            </h1>
            <span className={classes.subtitle}>{ta("ترجمه‌های ${1}", [segmentTitle(params.segment)])}</span>
          </header>
          )}

          <section className={classes.card}>
            <div className={classes.langs}>
              {targetLocales.map((l) => {
                const done = progress(l);
                return (
                  <button
                    key={l}
                    type="button"
                    className={`${classes.lang} ${l === locale ? classes.langActive : ""}`}
                    onClick={() => setLocale(l)}
                  >
                    <span>{localeNames[l]}</span>
                    <span
                      className={`${classes.langCount} ${
                        done === fields.length && fields.length
                          ? classes.countDone
                          : done
                            ? classes.countPartial
                            : ""
                      }`}
                    >
                      {`${done}/${fields.length}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={classes.actionsBar}>
              <Button
                size="M"
                onClick={dirty ? save : undefined}
                variant={dirty ? "Primary" : "Disable"}
                isLoading={saving}
              >
                {ta("ذخیره")}
              </Button>
              {data.machine && (
                <>
                  <Button
                    size="M"
                    mode="Outline"
                    onClick={() => machineTranslate("one")}
                    isLoading={translating === "one"}
                  >
                    {ta("ترجمه خودکار به ${1}", [localeNames[locale]])}
                  </Button>
                  <Button
                    size="M"
                    mode="Outline"
                    onClick={() => machineTranslate("all")}
                    isLoading={translating === "all"}
                  >
                    {ta("ترجمه خودکار همه زبان‌ها")}
                  </Button>
                  <label className={classes.check}>
                    <input
                      type="checkbox"
                      checked={overwrite}
                      onChange={(e) => setOverwrite(e.target.checked)}
                    />
                    {ta("جایگزینی ترجمه‌های فعلی")}
                  </label>
                </>
              )}
            </div>
            {dirty && <p className={classes.note}>{ta("تغییرات ذخیره نشده دارید.")}</p>}
          </section>

          {fields.length === 0 && (
            <p className={classes.note}>{ta("این رکورد متن فارسی‌ای برای ترجمه ندارد.")}</p>
          )}

          {fields.map(([field, kind]) => {
            const source = data.source[field];
            const rtf = kind === "text" && isRtf(source);
            return (
              <section key={field} className={classes.fieldCard}>
                <div className={classes.fieldHead}>
                  <h3>{fieldTitles[field] || field}</h3>
                  {stale.has(field) && (
                    <span className={classes.staleBadge}>
                      {ta("متن فارسی بعد از این ترجمه تغییر کرده")}
                    </span>
                  )}
                </div>
                <div className={classes.fieldGrid}>
                  <div className={classes.source}>
                    <span className={classes.colTitle}>{ta("فارسی")}</span>
                    {rtf ? (
                      <div className={classes.rtfBox}>
                        <RenderRtf value={source as string} />
                      </div>
                    ) : Array.isArray(source) ? (
                      <ul className={classes.sourceList}>
                        {source.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={classes.sourceText}>{source}</p>
                    )}
                  </div>
                  <div className={classes.target} dir={dir} lang={locale}>
                    <span className={classes.colTitle}>{localeNames[locale]}</span>
                    {kind === "list" ? (
                      <StringListInput
                        key={`${locale}-${field}-${revision}`}
                        defaultValue={(values[field] as string[]) || []}
                        onChange={(e) => change(field, e)}
                      />
                    ) : rtf ? (
                      <RTFEditor
                        key={`${locale}-${field}-${revision}`}
                        // Start from the Persian layout (images, headings) when
                        // there is no translation yet.
                        defaultValue={(values[field] as string) || (source as string)}
                        onChange={(e) => {
                          if (e !== ((values[field] as string) || source)) change(field, e);
                        }}
                        hideMediaLibrary
                      />
                    ) : kind === "line" ? (
                      <input
                        className={classes.input}
                        value={(values[field] as string) || ""}
                        onChange={(e) => change(field, e.target.value)}
                      />
                    ) : (
                      <textarea
                        className={classes.textarea}
                        rows={Math.min(14, Math.max(3, Math.ceil(String(source).length / 90)))}
                        value={(values[field] as string) || ""}
                        onChange={(e) => change(field, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminContentTranslationPage;
