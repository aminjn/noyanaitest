"use client";

import {
  commentDocumentsDict,
  commentStatusDict,
  IComment,
} from "@/Components/Comment/CommentSection";
import NodesManager from "../UI/NodesManager";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
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
          value: (node) => node.author.phone,
          component: (node) => (
            <InlineLink href={adminPath(`/user/${node.author._id}`)}>
              {node.author.phone}
            </InlineLink>
          ),
          filter: "Multi",
        },
        createdAt: {
          name: "زمان ایجاد",
          value: (node) => new Date(node.createdAt),
          component: (node) => <FormatDate value={node.createdAt} />,
          filter: "Date",
        },
        refPath: {
          name: "مدل",
          value: (node) => commentDocumentsDict[node.refPath],
          filter: "Set",
        },
        resource: {
          name: "منبع",
          value: (node) => node.resource._id,
          component: (node) => (
            <InlineLink
              href={adminPath(
                `/${node.refPath.toLowerCase()}/${node.resource._id}`,
              )}
            >
              {node.resource._id}
            </InlineLink>
          ),
          filter: "Multi",
        },
        score: {
          name: "امتیاز",
          value: (node) => node.score,
          filter: "Number",
        },
        status: {
          name: "وضعیت",
          value: (node) => commentStatusDict[node.status],
          filter: "Set",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/comment/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
