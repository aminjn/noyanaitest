"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { blogTagFormRenderer, IBlogTag } from "./AdminManageBlogTgasPage";

const AdminManageBlogTagPage = () => {
  return (
    <NodeManager<IBlogTag>
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={blogTagFormRenderer}
          hookProps={{
            path: `${API}/auto/blogTag/${node._id}`,
            method: "POST",
            successCb: () => mutate(),
          }}
        />
      )}
      getTitle={(node) => node.name || node._id}
      modelName="blogTag"
    />
  );
};

export default AdminManageBlogTagPage;
