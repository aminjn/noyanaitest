"use client";

import {
  commentStatusDict,
  IComment,
} from "@/Components/Comment/CommentSection";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";

const AdminManageCommentPage = () => {
  return (
    <NodeManager<
      IComment<{
        Author: Record<never, never>;
        Votes: Record<never, never>;
        resource: Record<never, never>;
      }>
    >
      modelName="comment"
      getTitle={() => "نظر"}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageComment"
          items={[
            {
              title: "اطلاعات",
              content: (
                <>
                  <p style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}>
                    {node.content}
                  </p>
                  <CreateForm
                    defaultValue={node}
                    renderer={{
                      status: {
                        title: "وضعیت",
                        type: "select",
                        options: commentStatusDict,
                      },
                    }}
                    hookProps={{
                      path: `${API}/auto/comment/${node._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                  />
                </>
              ),
              id: "Info",
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageCommentPage;
