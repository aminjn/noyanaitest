"use client";

import {
  commentDocumentsDict,
  commentStatusDict,
  IComment,
} from "@/Components/Comment/CommentSection";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import { useModeration } from "../Support/moderation";
import supportClasses from "../Support/support.module.css";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

// admin route of each commentable model (lower-casing broke the camelCase
// ones: /paracliniC, /productpackage...)
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

// the commented page by its name, never its raw id
const resourceLabel = (resource: unknown) => {
  const r = resource as { name?: string; title?: string; firstName?: string; lastName?: string } | undefined;
  if (!r) return "—";
  return (
    r.name ||
    r.title ||
    [r.firstName, r.lastName].filter(Boolean).join(" ") ||
    ta("بدون نام")
  );
};

type AdminCommentRow = IComment<{
  Author: Record<never, never>;
  resource: Record<never, never>;
}> & { rejectReason?: string };

// Moderation queue: one by one or in bulk (checkboxes); a rejection keeps
// its reason on the comment.
const AdminManageCommentsPage = () => {
  const { setPopup } = usePopup();
  const hasAccess = useAccessLevel();
  const { data, error, mutate } = useSWR<AdminCommentRow[]>(
    `${API}/auto/comment`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res?.data?.data) ? res.data.data : [])),
  );
  const canModerate = hasAccess("Comment", "update");
  const { bar, checkboxColumn, tableRows, approve, reject } = useModeration({
    kind: "comments",
    rows: data || [],
    mutate,
  });

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("نظرات")}>
          <div className={supportClasses.stack}>
            {canModerate && bar}
            <Table
              name="AdminManagecomments"
              data={tableRows}
              renderer={{
                ...(canModerate ? { select: checkboxColumn } : {}),
                author: {
                  name: ta("نویسنده"),
                  value: (node) => node.author?.phone,
                  component: (node) =>
                    node.author ? (
                      <InlineLink href={adminPath(`/user/${node.author._id}`)}>
                        {node.author.phone || node.author._id}
                      </InlineLink>
                    ) : (
                      "—"
                    ),
                  filter: "Multi",
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => commentStatusDict[node.status],
                  component: (node) => (
                    <span title={node.rejectReason || undefined}>
                      {commentStatusDict[node.status] || node.status}
                      {node.status === "Rejected" && node.rejectReason && (
                        <span className={supportClasses.reason}>{` (${node.rejectReason})`}</span>
                      )}
                    </span>
                  ),
                  filter: "Set",
                },
                score: {
                  name: ta("امتیاز"),
                  value: (node) => node.score,
                  filter: "Number",
                },
                content: {
                  name: ta("متن نظر"),
                  value: (node) => node.content || "—",
                  filter: "Text",
                },
                refPath: {
                  name: ta("بخش"),
                  value: (node) => commentDocumentsDict[node.refPath],
                  filter: "Set",
                },
                resource: {
                  name: ta("مربوط به"),
                  value: (node) => resourceLabel(node.resource),
                  component: (node) =>
                    node.resource ? (
                      <InlineLink
                        href={adminPath(
                          `/${commentTargetPath[node.refPath as string] || node.refPath?.toLowerCase()}/${node.resource._id}`,
                        )}
                      >
                        {resourceLabel(node.resource)}
                      </InlineLink>
                    ) : (
                      "—"
                    ),
                  filter: "Multi",
                },
                createdAt: {
                  name: ta("تاریخ ثبت"),
                  value: (node) => new Date(node.createdAt),
                  filter: "Date",
                },
                actions: {
                  name: ta("عملیات"),
                  width: 168,
                  component: (node) => (
                    <TableActions>
                      {canModerate && node.status !== "Approved" && (
                        <IconButton
                          variant="Success"
                          title={ta("تایید و انتشار")}
                          onClick={() => approve([node._id])}
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      {canModerate && node.status !== "Rejected" && (
                        <IconButton
                          variant="Neutral"
                          title={ta("رد با ذکر دلیل")}
                          onClick={() => reject([node._id])}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                      <IconLink href={adminPath(`/comment/${node._id}`)} title={ta("مشاهده")}>
                        <EditIcon />
                      </IconLink>
                      {hasAccess("Comment", "delete") && (
                        <IconButton
                          variant="Danger"
                          title={ta("حذف")}
                          onClick={() =>
                            setPopup(
                              "Delete",
                              <DeleteShitPopup
                                modelName="comment"
                                nodeId={node._id}
                                mutate={mutate}
                              />,
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
            />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageCommentsPage;
