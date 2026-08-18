"use client";

import useSWR from "swr";
import { IArticle, IArticleCategory } from "./ClinicManageArticlesPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";

const ClinicManageArticlePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IArticle>(
    nodeId ? `${API}/blog/clinic/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/clinicpanel" },
    { title: getContent("articles"), target: "/clinicpanel/article" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={data}
          renderer={{
            title: { title: getContent("title"), type: "text" },
            summary: { title: getContent("summary"), type: "area" },
            image: { title: getContent("image"), type: "image" },
            readTime: { title: getContent("readTime"), type: "text" },
            category: {
              type: "nodes",
              title: getContent("category"),
              path: `${API}/blog/clinic/category`,
              multi: false,
              clearable: true,
              getOptionLabel: (node) =>
                (node as IArticleCategory).title ||
                (node as IArticleCategory)._id,
              getOptionValue: (node) => (node as IArticleCategory)._id,
              getDefaultValue: (node) =>
                typeof node.category === "string"
                  ? node.category
                  : node.category?._id,
            },
            content: {
              title: getContent("content"),
              type: "rtf",
              hideMediaLibrary: true,
            },
          }}
          hookProps={{
            path: `${API}/blog/clinic/${data._id}`,
            method: "POST",
            successCb: () => mutate(),
          }}
        />
      )}
    </HandleLoading>
  );
};

export default ClinicManageArticlePage;
