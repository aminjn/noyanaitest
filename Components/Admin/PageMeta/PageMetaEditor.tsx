"use client";

import { useState } from "react";
import useSWR from "swr";
import { API, DOMAIN } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import CreateForm from "../UI/CreateForm";
import HandleLoading from "../UI/HandleLoading";
import {
  IPageMeta,
  pageMetaNodeResourceTypes,
  PageMetaResourceType,
} from "./pageMetaConstants";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./PageMetaEditor.module.css";

type Preview = {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  noIndex?: boolean;
  schema?: { "@type"?: string }[];
};

// The SEO of one page (2026-10). It is generated from the record itself and
// the page type's «سئوی خودکار» template, so this box first shows that
// result; the manual entry (a PageMeta) is only an optional override, and
// deleting it puts the page back on the automatic SEO.
const PageMetaEditor = ({
  resourceType,
  slug,
}: {
  resourceType: PageMetaResourceType;
  slug?: string;
}) => {
  const pushNotification = useNotification();
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const isNodeType = (
    pageMetaNodeResourceTypes as readonly string[]
  ).includes(resourceType);
  const ready = !isNodeType || !!slug;

  const query = new URLSearchParams({ resourceType });
  if (slug) query.append("slug", slug);

  const { data, error, mutate } = useSWR<IPageMeta[]>(
    ready ? `${API}/auto/pageMeta?${query.toString()}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const previewQuery = new URLSearchParams({ path: resourceType });
  if (slug) previewQuery.append("slug", slug);
  const { data: preview, error: previewError, mutate: refreshPreview } =
    useSWR<Preview>(
      ready ? `${API}/admin/seo/preview?${previewQuery.toString()}` : null,
      (url: string) => fetcher({ url }).then((res) => res.data),
      { shouldRetryOnError: false },
    );

  if (!ready)
    return <div>{ta("برای مدیریت متادیتا ابتدا اسلاگ را تنظیم و ذخیره کنید")}</div>;

  const existing = Array.isArray(data) ? data[0] : undefined;
  // pages the resolver doesn't cover (e.g. «تماس با ما») only have the form
  const automatic = !previewError;
  const showForm = !automatic || manual || !!existing;

  const backToAutomatic = async () => {
    if (!existing) return setManual(false);
    setBusy(true);
    try {
      await fetcher({ url: `${API}/auto/pageMeta/${existing._id}`, method: "PUT" });
      pushNotification(ta("سئوی این صفحه به حالت خودکار برگشت"), "Success");
      setManual(false);
      await mutate();
      refreshPreview();
    } catch (err) {
      pushNotification((err as Error)?.message || ta("خطایی رخ داد"), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <HandleLoading data={!!data} error={error}>
      <div className={classes.main}>
        {automatic && (
          <section className={classes.auto}>
            <div className={classes.head}>
              <strong>{ta("سئوی این صفحه")}</strong>
              <span className={existing ? classes.badgeManual : classes.badge}>
                {existing ? ta("تنظیم دستی") : ta("خودکار")}
              </span>
            </div>
            <p className={classes.hint}>
              {ta("عنوان، توضیحات، تصویر و داده‌ی ساختاریافته از اطلاعات همین رکورد و قالب «سئوی خودکار» ساخته می‌شود؛ لازم نیست برای هر صفحه چیزی بنویسید. فقط برای یک استثنا آن را دستی تغییر دهید.")}
            </p>
            {preview ? (
              <div className={classes.serp}>
                <span className={classes.serpUrl} dir="ltr">
                  {preview.canonical?.startsWith("/") ? `${DOMAIN}${preview.canonical}` : preview.canonical}
                </span>
                <span className={classes.serpTitle}>{preview.title || "—"}</span>
                <span className={classes.serpDesc}>{preview.description || "—"}</span>
                {!!preview.noIndex && (
                  <span className={classes.warn}>{ta("این صفحه noindex است")}</span>
                )}
                {!!preview.schema?.length && (
                  <span className={classes.meta} dir="ltr">
                    schema.org:{" "}
                    {preview.schema
                      .map((s) => s?.["@type"])
                      .filter(Boolean)
                      .join(" + ")}
                  </span>
                )}
              </div>
            ) : (
              <HandleLoading data={false} />
            )}
            <div className={classes.actions}>
              {!showForm && (
                <button type="button" className={classes.ghost} onClick={() => setManual(true)}>
                  {ta("تغییر دستی")}
                </button>
              )}
              {showForm && (
                <button
                  type="button"
                  className={classes.ghost}
                  disabled={busy}
                  onClick={backToAutomatic}
                >
                  {ta("بازگشت به سئوی خودکار")}
                </button>
              )}
            </div>
          </section>
        )}
        {showForm && !!data && (
          <section className={classes.manual}>
            {automatic && (
              <p className={classes.hint}>
                {ta("هر فیلدی که خالی بماند همچنان خودکار پر می‌شود.")}
              </p>
            )}
            <CreateForm
              defaultValue={
                existing
                  ? {
                      ...existing,
                      webSchema: existing.webSchema
                        ? JSON.stringify(existing.webSchema, null, 2)
                        : undefined,
                    }
                  : undefined
              }
              hookProps={{
                path: existing
                  ? `${API}/auto/pageMeta/${existing._id}`
                  : `${API}/auto/pageMeta`,
                method: "POST",
                decorators: { resourceType, ...(slug ? { slug } : {}) },
                successCb: () => {
                  mutate();
                  refreshPreview();
                },
              }}
              renderer={{
                title: { type: "text", title: ta("عنوان (title)") },
                description: { type: "area", title: ta("توضیحات (description)") },
                keywords: { type: "strings", title: ta("کلمات کلیدی") },
                ogTitle: { type: "text", title: ta("عنوان اشتراک گذاری (og:title)") },
                ogDescription: {
                  type: "area",
                  title: ta("توضیحات اشتراک گذاری (og:description)"),
                },
                ogImage: {
                  type: "image",
                  title: ta("تصویر اشتراک گذاری (og:image)"),
                },
                canonicalUrl: { type: "text", title: ta("آدرس کنونیکال") },
                webSchema: { type: "area", title: ta("اسکیمای وب (JSON-LD)") },
                noIndex: { type: "bool", title: "noindex" },
                noFollow: { type: "bool", title: "nofollow" },
              }}
            />
          </section>
        )}
      </div>
    </HandleLoading>
  );
};

export default PageMetaEditor;
