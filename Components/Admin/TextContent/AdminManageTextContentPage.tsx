"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./AdminManageTextContentPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import useNotification from "@/Components/Hooks/useNotification";
import Loading from "../UI/Loading";
import ErrorMessage from "../UI/ErrorMessage";
import {
  Locale,
  locales,
  localeNames,
  localeDir,
  enabledLocales,
} from "@/Components/i18n/locales";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ITextContent = MongoDoc & { [key in ContentKey]: string };

type Messages = Record<string, string>;
type AllOverrides = Record<Locale, Messages>;

const PAGE_SIZE = 40;

// Bundled texts of one language (what the site shows when nothing is
// overridden), loaded on demand.
const loadBundled = (locale: Locale): Promise<Messages> =>
  import(`@/Components/i18n/messages/${locale}.json`).then((m) => m.default as Messages);

const Row = ({
  textKey,
  bundled,
  fallback,
  override,
  dir,
  readOnly,
  onSave,
}: {
  textKey: string;
  bundled?: string;
  fallback?: string;
  override?: string;
  dir: "rtl" | "ltr";
  readOnly: boolean;
  onSave: (value: string | null) => Promise<void>;
}) => {
  const [value, setValue] = useState(override ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(override ?? ""), [override]);
  const dirty = value !== (override ?? "");
  const shown = bundled && bundled !== textKey ? bundled : undefined;

  const save = async (next: string | null) => {
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td className={classes.keyCell}>
        <code>{textKey}</code>
      </td>
      <td className={classes.baseCell} dir={dir}>
        {shown ?? <span className={classes.missing}>{fallback ? `↩ ${fallback}` : "—"}</span>}
      </td>
      <td className={classes.editCell}>
        <textarea
          dir={dir}
          rows={1}
          value={value}
          placeholder={shown || fallback || ""}
          readOnly={readOnly || saving}
          onChange={(e) => setValue(e.target.value)}
        />
        {!readOnly && (
          <div className={classes.rowActions}>
            {dirty && (
              <button type="button" className={classes.save} onClick={() => save(value)} disabled={saving}>
                {ta("ذخیره")}
              </button>
            )}
            {override !== undefined && !dirty && (
              <button type="button" className={classes.reset} onClick={() => save(null)} disabled={saving}>
                {ta("بازگشت به پیش‌فرض")}
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

// UI text dictionary, per language. The site's texts come from the bundled
// messages files; anything saved here overrides them for that language only.
const AdminManageTextContentPage = () => {
  const hasAccess = useAccessLevel();
  const pushNotification = useNotification();
  const [locale, setLocale] = useState<Locale>("fa");
  const [search, setSearch] = useState("");
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [bundled, setBundled] = useState<Messages | null>(null);
  const [english, setEnglish] = useState<Messages>({});

  const { data: overrides, error, mutate } = useSWR<AllOverrides>(
    `${API}/admin/texts`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  useEffect(() => {
    let cancelled = false;
    setBundled(null);
    Promise.all([loadBundled(locale), loadBundled("en")]).then(([own, en]) => {
      if (cancelled) return;
      setBundled(own);
      setEnglish(en);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => setPage(1), [locale, search, onlyEdited, onlyMissing]);

  const keys = useMemo(() => {
    if (!bundled) return [];
    const own = overrides?.[locale] || {};
    const term = search.trim().toLowerCase();
    return Object.keys({ ...english, ...bundled })
      .filter((key) => !onlyEdited || own[key] !== undefined)
      .filter((key) => !onlyMissing || !bundled[key] || bundled[key] === key)
      .filter(
        (key) =>
          !term ||
          key.toLowerCase().includes(term) ||
          (bundled[key] || "").toLowerCase().includes(term) ||
          (own[key] || "").toLowerCase().includes(term),
      )
      .sort();
  }, [bundled, english, overrides, locale, search, onlyEdited, onlyMissing]);

  const readOnly = !hasAccess("TextContent", "update");
  const pages = Math.max(1, Math.ceil(keys.length / PAGE_SIZE));
  const visible = keys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const editedCount = Object.keys(overrides?.[locale] || {}).length;

  const saveText = async (key: string, value: string | null) => {
    try {
      await fetcher({ url: `${API}/admin/texts`, method: "PATCH", payload: { locale, key, value } });
      await mutate();
      pushNotification(value === null ? ta("به متن پیش‌فرض برگشت") : ta("ذخیره شد"), "Success");
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{ta("لغت‌نامه")}</h1>
        <p className={classes.subtitle}>
          {ta("متن‌های سایت برای هر زبان. متن پیش‌فرض همراه برنامه است؛ هر چیزی این‌جا ذخیره کنید فقط برای همان زبان جایگزین متن پیش‌فرض می‌شود.")}
        </p>
      </header>

      <div className={classes.langs}>
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            className={`${classes.lang} ${code === locale ? classes.langActive : ""}`}
            onClick={() => setLocale(code)}
          >
            <span>{localeNames[code]}</span>
            {!enabledLocales.includes(code) && <span className={classes.off}>{ta("غیرفعال")}</span>}
          </button>
        ))}
      </div>

      <section className={classes.card}>
        <div className={classes.toolbar}>
          <input
            className={classes.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ta("جستجو در کلید یا متن...")}
          />
          <label className={classes.check}>
            <input type="checkbox" checked={onlyEdited} onChange={(e) => setOnlyEdited(e.target.checked)} />
            {ta("فقط ویرایش‌شده‌ها (")}{editedCount})
          </label>
          <label className={classes.check}>
            <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
            {ta("فقط بدون ترجمه")}
          </label>
          <span className={classes.count}>{keys.length} {ta("متن")}</span>
        </div>

        {error ? (
          <ErrorMessage message={error.message} />
        ) : !overrides || !bundled ? (
          <Loading />
        ) : (
          <>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{ta("کلید")}</th>
                    <th>{ta("متن پیش‌فرض (${1})", [localeNames[locale]])}</th>
                    <th>{ta("متن جایگزین")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((key) => (
                    <Row
                      key={`${locale}:${key}`}
                      textKey={key}
                      bundled={bundled[key]}
                      fallback={locale !== "en" ? english[key] : undefined}
                      override={overrides[locale]?.[key]}
                      dir={localeDir(locale)}
                      readOnly={readOnly}
                      onSave={(value) => saveText(key, value)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className={classes.pagination}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {ta("قبلی")}
                </button>
                <span>{ta("صفحه ${1} از ${2}", [page, pages])}</span>
                <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  {ta("بعدی")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminManageTextContentPage;
