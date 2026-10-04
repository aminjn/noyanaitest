"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { MongoDoc } from "@/Components/Hooks/useUser";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DeleteBlogPopup from "./DeleteBlogPopup";
import OrderEditor from "../UI/OrderEditor";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  BlogTagPopulation,
  IBlogTag,
} from "../BlogTag/AdminManageBlogTgasPage";
import useProgress from "@/Components/Hooks/useProgress";
import { ta } from "@/Components/Admin/i18n/adminText";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PublishToggle from "../UI/PublishToggle";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import useNotification from "@/Components/Hooks/useNotification";
import { moderate, RejectReasonPopup } from "../Support/moderation";

export type BlogCategoryPopulation = Population<Record<never, never>>;

export interface IBlogCategory<
  T extends BlogCategoryPopulation = BlogCategoryPopulation,
> extends MongoDoc {
  title?: string;
  slug?: string;
  order: number;
}

type BlogPopulation = Population<{
  CategoryPopulated?: BlogCategoryPopulation;
  RelatedPopulated?: BlogPopulation;
  Tags: BlogTagPopulation;
}>;

export interface IBlog<
  T extends BlogPopulation = BlogPopulation,
> extends MongoDoc {
  image?: string;
  title?: string;
  summary?: string;
  publishedAt: Date;
  order: number;
  slug?: string;
  content?: string;
  author?: string;
  // Set when this post was submitted by an organization panel (doctor/
  // clinic/pharmacy/insurance/paraClinic) instead of written by an admin.
  // Those posts always come in unpublished and stay that way until an admin
  // reviews and publishes them here.
  authorType?: "doctor" | "clinic" | "pharmacy" | "insurance" | "paraClinic";
  // the review of a submitted post (none on the admin's own posts)
  reviewStatus?: "pending" | "approved" | "rejected";
  rejectReason?: string;
  readTime?: string;
  related: T["RelatedPopulated"] extends BlogPopulation ? IBlog[] : string[];
  thisWeekSpecial: boolean;
  home: boolean;
  published: boolean;
  category?: T["CategoryPopulated"] extends BlogCategoryPopulation
    ? IBlogCategory<T["CategoryPopulated"]>
    : string;
  recommended: boolean;
  chosen: boolean;
  tags: T["Tags"] extends BlogTagPopulation ? IBlogTag<T["Tags"]>[] : string[];
}

const authorTypeLabels: Record<string, string> = {
  get doctor() {
    return ta("پزشک");
  },
  get clinic() {
    return ta("کلینیک");
  },
  get pharmacy() {
    return ta("داروخانه");
  },
  get insurance() {
    return ta("بیمه");
  },
  get paraClinic() {
    return ta("پاراکلینیک");
  },
};

// a provider's post the admin hasn't decided yet (the same rule as the
// backend's blogAwaitingReviewFilter, which feeds the inbox)
const awaitsReview = (node: IBlog) =>
  !!node.authorType &&
  !node.published &&
  node.reviewStatus !== "approved" &&
  node.reviewStatus !== "rejected";

const reviewLabel = (node: IBlog) => {
  if (!node.authorType) return ta("ادمین");
  if (awaitsReview(node)) return ta("در انتظار بررسی");
  if (node.reviewStatus === "rejected") return ta("رد شده");
  return ta("تایید شده");
};

const AdminManageBlogsPage = () => {
  const { data, error, mutate } = useSWR<
    IBlog<{
      RelatedPopulated: Record<never, never>;
      CategoryPopulated: Record<never, never>;
    }>[]
  >(`${API}/auto/blog`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const hasAccess = useAccessLevel();

  const { setPopup } = usePopup();
  const push = useProgress();
  const pushNotification = useNotification();
  // the inbox's "see all" for submitted articles opens ?review=pending
  const reviewOnly = useSearchParams()?.get("review") === "pending";
  const rows = useMemo(
    () =>
      (Array.isArray(data) ? data : []).filter(
        (node) => !reviewOnly || awaitsReview(node),
      ),
    [data, reviewOnly],
  );
  const canModerate = hasAccess("Blog", "update");
  const approve = async (ids: string[]) => {
    try {
      await moderate("blogs", ids, "Approved");
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("مقالات")}
          actions={[
            ...(reviewOnly
              ? [
                  {
                    title: ta("همه‌ی مقاله‌ها"),
                    action: () => push(adminPath("/blog")),
                  },
                ]
              : []),
            ...(hasAccess("Blog", "write")
              ? [
                  {
                    title: ta("جدید"),
                    // the full form, saved once (AdminRecordEditor)
                    action: () => push(adminPath("/blog/new")),
                  },
                ]
              : []),
          ]}
        >
          <Table
            data={rows}
            renderer={{
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                component: (node) => (
                  <InlineLink href={adminPath(`/blog/${node._id}`)}>
                    {node.title || "—"}
                  </InlineLink>
                ),
                filter: "Text",
              },
              published: {
                name: ta("انتشار"),
                value: (node) => booleanToValue[`${!!node.published}`],
                filter: "Set",
                // publishing a submitted post approves it (backend hook)
                component: (node) => (
                  <PublishToggle
                    modelName="blog"
                    _id={node._id}
                    value={!!node.published}
                    mutate={mutate}
                    disabled={!canModerate}
                  />
                ),
              },
              review: {
                name: ta("بررسی"),
                value: (node) => reviewLabel(node),
                filter: "Set",
                component: (node) => (
                  <span title={node.rejectReason || undefined}>
                    {reviewLabel(node)}
                    {node.reviewStatus === "rejected" && node.rejectReason
                      ? ` (${node.rejectReason})`
                      : ""}
                  </span>
                ),
              },
              category: {
                name: ta("دسته‌بندی"),
                value: (node) =>
                  node.category
                    ? node.category.title || ta("بدون نام")
                    : ta("ندارد"),
                filter: "Multi",
                component: (node) =>
                  node.category ? (
                    <InlineLink href={adminPath("/blog?tab=categories")}>
                      {node.category.title || ta("بدون نام")}
                    </InlineLink>
                  ) : (
                    ta("ندارد")
                  ),
              },
              author: {
                name: ta("نویسنده"),
                value: (node) => node.author,
                filter: "Multi",
              },
              authorType: {
                name: ta("منبع"),
                value: (node) =>
                  node.authorType
                    ? authorTypeLabels[node.authorType] || node.authorType
                    : ta("ادمین"),
                filter: "Set",
              },
              publishedAt: {
                name: ta("تاریخ انتشار"),
                value: (node) =>
                  node.publishedAt ? new Date(node.publishedAt) : undefined,
                filter: "Date",
              },
              order: {
                name: ta("رتبه"),
                filter: "Number",
                value: (node) => node.order,
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="blog"
                    mutate={mutate}
                    value={node.order}
                  />
                ),
              },
              home: {
                name: ta("نمایش در خانه"),
                filter: "Set",
                value: (node) => booleanToValue[`${node.home}`],
                component: (node) => <BooleanToIcon value={node.home} />,
              },
              thisWeekSpecial: {
                name: ta("ویژه هفته"),
                filter: "Set",
                value: (node) => booleanToValue[`${node.thisWeekSpecial}`],
                component: (node) => (
                  <BooleanToIcon value={node.thisWeekSpecial} />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {canModerate && awaitsReview(node) && (
                      <IconButton
                        variant="Success"
                        title={ta("تایید و انتشار")}
                        onClick={() => approve([node._id])}
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    {canModerate &&
                      !!node.authorType &&
                      node.reviewStatus !== "rejected" && (
                        <IconButton
                          variant="Neutral"
                          title={ta("رد با ذکر دلیل")}
                          onClick={() =>
                            setPopup(
                              "RejectReason",
                              <RejectReasonPopup
                                kind="blogs"
                                ids={[node._id]}
                                onDone={mutate}
                              />,
                            )
                          }
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    {hasAccess("Blog", "readOne") && (
                      <IconLink
                        href={adminPath(`/blog/${node._id}`)}
                        title={ta("ویرایش")}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Blog", "delete") && (
                      <IconButton
                        variant="Danger"
                        title={ta("حذف")}
                        onClick={() =>
                          setPopup(
                            "DeleteBlog",
                            <DeleteBlogPopup node={node} mutate={mutate} />,
                          )
                        }
                      >
                        <GarbageIcon />
                      </IconButton>
                    )}
                  </TableActions>
                ),
              },
            }}
            name="AdminManageBlogs"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogsPage;
