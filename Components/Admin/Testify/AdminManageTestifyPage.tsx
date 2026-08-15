"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ITestify, testifyFormRenderer } from "./AdminManageTestifiesPage";

const AdminManageTestifyPage = () => {
  return (
    <NodeManager<ITestify>
      getTitle={(node) => node.name || node._id}
      modelName="testify"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={testifyFormRenderer}
          hookProps={{
            path: `${API}/auto/testify/${node._id}`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
        />
      )}
    />
  );
};

export default AdminManageTestifyPage;
