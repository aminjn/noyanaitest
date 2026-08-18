"use client";
import useSWR from "swr";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import InsuranceMutateArticlePopup from "./InsuranceMutateArticlePopup";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteArticlePopup from "./DeleteArticlePopup";

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
  category?: IArticleCategory | string;
  createdAt?: string;
}

const InsuranceManageArticlesPage = () => {
  const { data, error, mutate } = useSWR<IArticle[]>(
    `${API}/blog/insurance`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
    { title: getContent("articles"), target: "/insurancepanel/article" },
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
                  "InsuranceMutateArticle",
                  <InsuranceMutateArticlePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <p>{getContent("articleModerationNotice")}</p>
          <Table
            data={data}
            name="InsuranceManageArticles"
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
                value: (node) =>
                  node.published
                    ? getContent("articlePublished")
                    : getContent("articlePendingReview"),
                filter: "Set",
                component: (node) => (
                  <span>
                    {node.published
                      ? getContent("articlePublished")
                      : getContent("articlePendingReview")}
                  </span>
                ),
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink href={`/insurancepanel/article/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "InsuranceDeleteArticle",
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

export default InsuranceManageArticlesPage;
