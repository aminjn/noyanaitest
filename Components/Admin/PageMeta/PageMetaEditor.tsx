"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import CreateForm from "../UI/CreateForm";
import HandleLoading from "../UI/HandleLoading";
import {
  IPageMeta,
  pageMetaNodeResourceTypes,
  PageMetaResourceType,
} from "./pageMetaConstants";
import { ta } from "@/Components/Admin/i18n/adminText";

// finds the PageMeta record matching this resourceType (+ slug for node pages),
// or falls back to creating a new one on first submit
const PageMetaEditor = ({
  resourceType,
  slug,
}: {
  resourceType: PageMetaResourceType;
  slug?: string;
}) => {
  const isNodeType = (
    pageMetaNodeResourceTypes as readonly string[]
  ).includes(resourceType);

  const query = new URLSearchParams({ resourceType });
  if (slug) query.append("slug", slug);

  const { data, error, mutate } = useSWR<IPageMeta[]>(
    !isNodeType || slug ? `${API}/auto/pageMeta?${query.toString()}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  if (isNodeType && !slug)
    return <div>{ta("برای مدیریت متادیتا ابتدا اسلاگ را تنظیم و ذخیره کنید")}</div>;

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
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
            successCb: () => mutate(),
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
      )}
    </HandleLoading>
  );
};

export default PageMetaEditor;
