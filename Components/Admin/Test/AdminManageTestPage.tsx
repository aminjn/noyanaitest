"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ITest, testFormRenderer } from "./AdminManageTestsPage";

const AdminManageTestPage = () => {
  return (
    <NodeManager<ITest>
      modelName="test"
      getTitle={(node) => node.name || node._id}
      content={({ node, mutate }) => (
        <CreateForm
          defaultValue={node}
          renderer={testFormRenderer}
          hookProps={{
            path: `${API}/auto/test/${node._id}`,
            method: "POST",
            successCb: () => mutate(),
          }}
        />
      )}
    />
  );
};

export default AdminManageTestPage;
