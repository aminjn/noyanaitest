"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { API, DOMAIN } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { ta } from "@/Components/Admin/i18n/adminText";
import { Locale, locales, localeNames, localeDir, SOURCE_LOCALE } from "@/Components/i18n/locales";
import { pageMetaListResourceTypeLabels } from "@/Components/Admin/PageMeta/pageMetaConstants";
import HandleLoading from "../UI/HandleLoading";
import classes from "./AdminSeoTemplatesPage.module.css";

// سئوی خودکار (2026-10): one template per page type, filled from each
// record (backend Lib/seo/seoResolver.ts), so no doctor, pharmacy or drug
// needs its own SEO entry. «متادیتای صفحات» stays for the few pages that
// need a hand-written one; it wins field by field.

type Tpl = { title?: string; description?: string; keywords?: string[] };
type Row = {
  path: string;
  kind: "node" | "list";
  variables: string[];
  saved: (Tpl & { noIndex?: boolean; translations?: Partial<Record<Locale, Tpl>> }) | null;
  defaults: Partial<Record<Locale, Tpl | null>>;
};
type Preview = {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  schema?: { "@type"?: string | string[] }[];
  vars?: Record<string, string>;
  slug?: string;
};

const nodeLabels: Record<string, () => string> = {
  "/dr/[slug]": () => ta("صفحه‌ی پزشک"),
  "/clinic/[slug]": () => ta("صفحه‌ی کلینیک"),
  "/hospital/[slug]": () => ta("صفحه‌ی بیمارستان"),
  "/paraClinic/[slug]": () => ta("صفحه‌ی آزمایشگاه و تصویربرداری"),
  "/pharmacy/[slug]": () => ta("صفحه‌ی داروخانه"),
  "/insurance/[slug]": () => ta("صفحه‌ی بیمه"),
  "/drug/[slug]": () => ta("صفحه‌ی دارو"),
  "/disease/[slug]": () => ta("صفحه‌ی بیماری"),
  "/symptom/[slug]": () => ta("صفحه‌ی علامت"),
  "/speciality/[slug]": () => ta("صفحه‌ی تخصص"),
  "/service/[slug]": () => ta("صفحه‌ی خدمت"),
  "/servicePackage/[slug]": () => ta("صفحه‌ی بسته‌ی خدمت"),
  "/product/[slug]": () => ta("صفحه‌ی محصول"),
  "/productPackage/[slug]": () => ta("صفحه‌ی بسته‌ی محصول"),
  "/mag/[blogSlug]": () => ta("صفحه‌ی مقاله"),
  // the medical directory's facet pages (2026-10)
  "/disease/letter/[letter]": () => ta("فهرست بیماری‌ها بر اساس حرف"),
  "/disease/part/[slug]": () => ta("فهرست بیماری‌ها بر اساس عضو بدن"),
  "/disease/speciality/[slug]": () => ta("فهرست بیماری‌ها بر اساس تخصص"),
  "/disease/category/[slug]": () => ta("فهرست بیماری‌ها بر اساس دسته"),
  "/drug/letter/[letter]": () => ta("فهرست داروها بر اساس حرف"),
  "/drug/class/[slug]": () => ta("فهرست داروها بر اساس گروه درمانی"),
  "/drug/status/[slug]": () => ta("فهرست داروها بر اساس نوع نسخه"),
  "/symptom/letter/[letter]": () => ta("فهرست علائم بر اساس حرف"),
  "/symptom/part/[slug]": () => ta("فهرست علائم بر اساس عضو بدن"),
  "/symptom/category/[slug]": () => ta("فهرست علائم بر اساس دسته"),
};

const variableLabels: Record<string, () => string> = {
  name: () => ta("نام"),
  speciality: () => ta("تخصص اصلی"),
  specialities: () => ta("همه‌ی تخصص‌ها"),
  city: () => ta("شهر"),
  province: () => ta("استان"),
  district: () => ta("محله"),
  rating: () => ta("امتیاز"),
  reviews: () => ta("تعداد نظرات"),
  price: () => ta("قیمت (تومان)"),
  summary: () => ta("خلاصه‌ی معرفی"),
  phone: () => ta("تلفن"),
  hours: () => ta("ساعات کاری"),
  category: () => ta("دسته‌بندی"),
  alternateName: () => ta("نام دیگر"),
  ingredient: () => ta("ماده‌ی مؤثر"),
  form: () => ta("شکل دارویی"),
  count: () => ta("تعداد"),
  provider: () => ta("ارائه‌دهنده"),
};

const labelOf = (row: Row) =>
  row.kind === "node"
    ? nodeLabels[row.path]?.() || row.path
    : (pageMetaListResourceTypeLabels as Record<string, string>)[row.path] || (row.path === "/" ? ta("صفحه‌ی اصلی") : row.path);

const AdminSeoTemplatesPage = () => {
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<Row[]>(`${API}/admin/seo/templates`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [path, setPath] = useState<string>("/dr/[slug]");
  const [locale, setLocale] = useState<Locale>(SOURCE_LOCALE);
  const row = rows.find((r) => r.path === path) || rows[0];

  // draft: source fields + per-language versions, like any translatable content
  const [source, setSource] = useState<Tpl>({});
  const [translations, setTranslations] = useState<Partial<Record<Locale, Tpl>>>({});
  const [noIndex, setNoIndex] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sample, setSample] = useState("");
  const focused = useRef<"title" | "description">("title");

  useEffect(() => {
    if (!row) return;
    setSource({
      title: row.saved?.title || row.defaults.fa?.title || "",
      description: row.saved?.description || row.defaults.fa?.description || "",
      keywords: row.saved?.keywords?.length ? row.saved.keywords : row.defaults.fa?.keywords || [],
    });
    setTranslations(row.saved?.translations || {});
    setNoIndex(!!row.saved?.noIndex);
    setSample("");
  }, [row]);

  const isSource = locale === SOURCE_LOCALE;
  const current: Tpl = isSource
    ? source
    : translations[locale] || { title: "", description: "", keywords: [] };
  const placeholderFor = (field: keyof Tpl) => {
    const d = row?.defaults[locale] || row?.defaults.en;
    const v = d?.[field];
    return Array.isArray(v) ? v.join("، ") : v || "";
  };
  const setField = (field: keyof Tpl, value: string | string[]) => {
    if (isSource) setSource((s) => ({ ...s, [field]: value }));
    else setTranslations((t) => ({ ...t, [locale]: { ...(t[locale] || {}), [field]: value } }));
  };

  const previewKey = row
    ? `${API}/admin/seo/preview?${new URLSearchParams({ path: row.path, locale, ...(sample ? { slug: sample } : {}) })}`
    : null;
  const { data: preview, mutate: refreshPreview } = useSWR<Preview>(previewKey, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const save = async () => {
    if (!row) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/seo/template?path=${encodeURIComponent(row.path)}`,
        method: "PUT",
        bodyParser: "JSON",
        payload: {
          title: source.title || "",
          description: source.description || "",
          keywords: (source.keywords || []).filter(Boolean),
          noIndex,
          translations: Object.fromEntries(
            Object.entries(translations).map(([l, t]) => [
              l,
              { title: t?.title || "", description: t?.description || "", keywords: (t?.keywords || []).filter(Boolean) },
            ]),
          ),
        },
      });
      pushNotification(ta("قالب ذخیره شد"), "Success");
      await mutate();
      refreshPreview();
    } catch (err) {
      pushNotification((err as Error)?.message || ta("خطایی رخ داد"), "Error");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!row) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}/admin/seo/template?path=${encodeURIComponent(row.path)}`, method: "DELETE" });
      pushNotification(ta("قالب به حالت پیش‌فرض برگشت"), "Success");
      await mutate();
      refreshPreview();
    } catch (err) {
      pushNotification((err as Error)?.message || ta("خطایی رخ داد"), "Error");
    } finally {
      setBusy(false);
    }
  };

  const insert = (v: string) => {
    const field = focused.current;
    setField(field, `${current[field] || ""}${current[field] ? " " : ""}{${v}}`);
  };

  const groups: { title: string; kind: Row["kind"] }[] = [
    { title: ta("صفحه‌های تکی (هر پزشک، داروخانه، دارو و...)"), kind: "node" },
    { title: ta("صفحه‌های فهرست"), kind: "list" },
  ];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!row && (
        <div className={classes.main}>
          <p className={classes.intro}>
            {ta(
              "برای هر نوع صفحه یک قالب بنویسید؛ عنوان، توضیحات، کلمات کلیدی، آدرس اصلی (canonical)، تصویر و داده‌ی ساختاریافته‌ی هر صفحه خودکار از اطلاعات همان رکورد ساخته می‌شود. {متغیر} با مقدار رکورد پر می‌شود و بخشی که داخل [ ] است اگر متغیرش خالی باشد حذف می‌شود. صفحه‌ای که در «متادیتای صفحات» دستی تنظیم شده، همان مقدار دستی را می‌گیرد.",
            )}
          </p>
          <div className={classes.layout}>
            <nav className={classes.types}>
              {groups.map((g) => (
                <div key={g.kind} className={classes.group}>
                  <span className={classes.groupTitle}>{g.title}</span>
                  {rows
                    .filter((r) => r.kind === g.kind)
                    .map((r) => (
                      <button
                        key={r.path}
                        type="button"
                        className={`${classes.type} ${r.path === row.path ? classes.typeOn : ""}`}
                        onClick={() => setPath(r.path)}
                      >
                        <span>{labelOf(r)}</span>
                        {!!r.saved && <span className={classes.badge}>{ta("سفارشی")}</span>}
                      </button>
                    ))}
                </div>
              ))}
            </nav>

            <section className={classes.editor}>
              <div className={classes.editorHead}>
                <h2 className={classes.h2}>{labelOf(row)}</h2>
                <select
                  className={classes.select}
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  aria-label={ta("زبان")}
                >
                  {locales.map((l) => (
                    <option key={l} value={l}>
                      {localeNames[l]}
                      {l === SOURCE_LOCALE ? ` (${ta("مبنا")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {!!row.variables.length && (
                <div className={classes.vars}>
                  <span className={classes.label}>{ta("متغیرها (کلیک کنید تا اضافه شود)")}</span>
                  <div className={classes.chips}>
                    {row.variables.map((v) => (
                      <button key={v} type="button" className={classes.chip} onClick={() => insert(v)}>
                        <code dir="ltr">{`{${v}}`}</code> {variableLabels[v]?.() || v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className={classes.field}>
                <span className={classes.label}>{ta("عنوان")}</span>
                <input
                  dir={localeDir(locale)}
                  value={current.title || ""}
                  placeholder={placeholderFor("title")}
                  onFocus={() => (focused.current = "title")}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </label>
              <label className={classes.field}>
                <span className={classes.label}>{ta("توضیحات")}</span>
                <textarea
                  dir={localeDir(locale)}
                  rows={4}
                  value={current.description || ""}
                  placeholder={placeholderFor("description")}
                  onFocus={() => (focused.current = "description")}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </label>
              <label className={classes.field}>
                <span className={classes.label}>{ta("کلمات کلیدی (هر خط یکی)")}</span>
                <textarea
                  dir={localeDir(locale)}
                  rows={3}
                  value={(current.keywords || []).join("\n")}
                  placeholder={placeholderFor("keywords")}
                  onChange={(e) => setField("keywords", e.target.value.split("\n"))}
                />
              </label>
              {isSource && (
                <label className={classes.check}>
                  <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} />
                  <span>{ta("این نوع صفحه در نتایج جستجو نمایش داده نشود (noindex)")}</span>
                </label>
              )}
              <div className={classes.actions}>
                <button type="button" className={classes.primary} disabled={busy} onClick={save}>
                  {ta("ذخیره")}
                </button>
                {!!row.saved && (
                  <button type="button" className={classes.ghost} disabled={busy} onClick={reset}>
                    {ta("بازگشت به قالب پیش‌فرض")}
                  </button>
                )}
              </div>
            </section>

            <aside className={classes.preview}>
              <div className={classes.previewHead}>
                <span className={classes.label}>{ta("پیش‌نمایش در گوگل")}</span>
                {row.kind === "node" && (
                  <input
                    className={classes.sample}
                    dir="ltr"
                    placeholder={ta("نامک (slug) رکورد نمونه")}
                    defaultValue=""
                    onBlur={(e) => setSample(e.target.value.trim())}
                  />
                )}
              </div>
              {preview ? (
                <div className={classes.serp} dir={localeDir(locale)}>
                  <span className={classes.serpUrl} dir="ltr">
                    {preview.canonical?.startsWith("/") ? `${DOMAIN}${preview.canonical}` : preview.canonical}
                  </span>
                  <span className={classes.serpTitle}>{preview.title || "—"}</span>
                  <span className={classes.serpDesc}>{preview.description || "—"}</span>
                  {!!preview.noIndex && <span className={classes.warn}>{ta("این صفحه noindex است")}</span>}
                  {!!preview.keywords?.length && (
                    <span className={classes.meta}>
                      {ta("کلمات کلیدی")}: {preview.keywords.join("، ")}
                    </span>
                  )}
                  {!!preview.schema?.length && (
                    <span className={classes.meta} dir="ltr">
                      schema.org: {preview.schema.map((s) => [s["@type"]].flat().join("/")).filter(Boolean).join(" + ")}
                    </span>
                  )}
                  <span className={classes.meta}>{ta("ذخیره نشده‌ها در پیش‌نمایش دیده نمی‌شوند؛ بعد از ذخیره به‌روز می‌شود.")}</span>
                </div>
              ) : (
                <p className={classes.meta}>{ta("رکوردی برای پیش‌نمایش پیدا نشد")}</p>
              )}
            </aside>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminSeoTemplatesPage;
