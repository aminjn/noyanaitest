"use client";
import { articleStatusOf } from "@/Components/_Common/OrgArticle/orgArticle";
import useSWR from "swr";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import DoctorMutateArticlePopup from "./DoctorMutateArticlePopup";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteArticlePopup from "./DeleteArticlePopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelArticle"];

export interface IArticleCategory extends MongoDoc {
  title?: string;
}

export interface IArticle extends MongoDoc {
  title?: string;
  summary?: string;
  image?: string;
  content?: string;
  readTime?: string;
  slug?: string;
  published: boolean;
  // the admin's review: a rejected post carries the reason
  reviewStatus?: "pending" | "approved" | "rejected";
  rejectReason?: string;
  category?: IArticleCategory | string;
  createdAt?: string;
}

const DoctorManageArticlesPage = () => {
  const { data, error, mutate } = useSWR<IArticle[]>(
    `${API}/blog/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("articles"), target: "/doctorpanel/article" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("articles")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "DoctorMutateArticle",
                  <DoctorMutateArticlePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <p>{getContent("articleModerationNotice")}</p>
          <Table
            data={data}
            name="DoctorManageArticles"
            renderer={{
              title: {
                name: getContent("title"),
                value: (node) => node.title,
                filter: "Text",
              },
              summary: {
                name: getContent("summary"),
                value: (node) => node.summary,
                filter: "Text",
              },
              category: {
                name: getContent("category"),
                value: (node) =>
                  typeof node.category === "string"
                    ? node.category
                    : node.category?.title || "",
                filter: "Multi",
              },
              readTime: {
                name: getContent("readTime"),
                value: (node) => node.readTime,
                filter: "Text",
              },
              published: {
                name: getContent("publishStatus"),
                value: (node) => articleStatusOf(node, getContent),
                filter: "Set",
                // a rejected post says why (and goes back to review once edited)
                component: (node) => (
                  <span>
                    {articleStatusOf(node, getContent)}
                    {node.reviewStatus === "rejected" && !!node.rejectReason
                      ? ` - ${getContent("reason")}: ${node.rejectReason}`
                      : ""}
                  </span>
                ),
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink href={`/doctorpanel/article/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DoctorDeleteArticle",
                          <DeleteArticlePopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DoctorManageArticlesPage;
