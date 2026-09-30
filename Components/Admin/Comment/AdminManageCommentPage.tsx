"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  commentDocumentsDict,
  commentStatusDict,
  IComment,
} from "@/Components/Comment/CommentSection";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import FormatDate from "@/Components/UI/FormatDate";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import InlineLink from "../UI/InlineLink";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import RequestInfoGrid from "../BecomeRequest/RequestInfoGrid";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminManageCommentPage.module.css";

// admin route of each commentable model (same map as the comments list)
const commentTargetPath: Record<string, string> = {
  Blog: "blog",
  Disease: "disease",
  Symptom: "symptom",
  Drug: "drug",
  Comment: "comment",
  Product: "product",
  Clinic: "clinic",
  ProductPackage: "productPackage",
  Service: "service",
  ServicePackage: "servicePackage",
  ParaClinic: "paraClinic",
  Hospital: "hospital",
  Insurance: "insurance",
  DoctorProfile: "doctorprofile",
};

type AdminComment = IComment<{
  Author: Record<never, never>;
  Votes: Record<never, never>;
  resource: Record<never, never>;
}>;

// a populated resource's display name (blogs / diseases have a title, centres
// a name, a doctor profile first and last names)
const resourceName = (resource: unknown): string => {
  if (!resource || typeof resource !== "object") return "";
  const r = resource as {
    name?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    content?: string;
  };
  return (
    r.name ||
    r.title ||
    [r.firstName, r.lastName].filter(Boolean).join(" ") ||
    (r.content ? r.content.slice(0, 60) : "")
  );
};

// A comment's moderation page (2026-09): who wrote what about which page,
// then the only thing an admin may change - its status (the backend's
// editSchema accepts nothing else). Delete sits in the header.
const AdminManageCommentPage = () => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId;
  const { data, error, mutate } = useSWR<AdminComment | null>(
    nodeId ? `${API}/auto/comment/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();

  const author =
    data?.author && typeof data.author === "object" ? data.author : null;
  const resource =
    data?.resource && typeof data.resource === "object" ? data.resource : null;
  const route = data ? commentTargetPath[data.refPath as string] : undefined;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("نظر")}
          actions={
            hasAccess("Comment", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteComment",
                        <DeleteShitPopup
                          modelName="comment"
                          nodeId={data._id}
                          mutate={() => push(adminPath("/comment"))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <div className={classes.main}>
            <RequestInfoGrid
              items={[
                {
                  label: ta("نویسنده"),
                  value: author?._id ? (
                    <InlineLink href={adminPath(`/user/${author._id}`)}>
                      {author.phone || ta("مشاهده کاربر")}
                    </InlineLink>
                  ) : undefined,
                },
                {
                  label: ta("بخش"),
                  value: commentDocumentsDict[data.refPath],
                },
                {
                  label: ta("مربوط به"),
                  value:
                    resource?._id && route ? (
                      <InlineLink
                        href={adminPath(`/${route}/${resource._id}`)}
                      >
                        {resourceName(resource) || ta("بدون نام")}
                      </InlineLink>
                    ) : undefined,
                },
                { label: ta("امتیاز"), value: data.score },
                {
                  label: ta("تاریخ ثبت"),
                  value: data.createdAt ? (
                    <FormatDate value={data.createdAt} />
                  ) : undefined,
                },
                {
                  label: ta("پسندها"),
                  value: Array.isArray(data.upvotes)
                    ? data.upvotes.length
                    : undefined,
                },
                { label: ta("متن نظر"), value: data.content, wide: true },
              ]}
            />
            <CreateForm
              defaultValue={data}
              renderer={{
                status: {
                  title: ta("وضعیت"),
                  type: "select",
                  options: commentStatusDict,
                },
              }}
              hookProps={{
                path: `${API}/auto/comment/${data._id}`,
                method: "POST",
                successCb: () => mutate(),
              }}
            />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageCommentPage;
