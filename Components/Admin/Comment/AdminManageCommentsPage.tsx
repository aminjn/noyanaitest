"use client";

import {
  commentDocumentsDict,
  commentStatusDict,
  IComment,
} from "@/Components/Comment/CommentSection";
import NodesManager from "../UI/NodesManager";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

const AdminManageCommentsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<
      IComment<{ Author: Record<never, never>; resource: Record<never, never> }>
    >
      modelName="comment"
      title={"نظرات"}
      table={({ mutate }) => ({
        author: {
          name: "نویسنده",
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
          name: "وضعیت",
          value: (node) => commentStatusDict[node.status],
          filter: "Set",
        },
        score: {
          name: "امتیاز",
          value: (node) => node.score,
          filter: "Number",
        },
        refPath: {
          name: "بخش",
          value: (node) => commentDocumentsDict[node.refPath],
          filter: "Set",
        },
        resource: {
          name: "مربوط به",
          value: (node) => node.resource?._id,
          component: (node) =>
            node.resource ? (
              <InlineLink
                href={adminPath(
                  `/${node.refPath?.toLowerCase()}/${node.resource._id}`,
                )}
              >
                {node.resource._id}
              </InlineLink>
            ) : (
              "—"
            ),
          filter: "Multi",
        },
        createdAt: {
          name: "تاریخ ثبت",
          value: (node) => new Date(node.createdAt),
          filter: "Date",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/comment/${node._id}`)} title="ویرایش">
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
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
            </TableActions>
          ),
        },
      })}
    />
  );
};

export default AdminManageCommentsPage;
