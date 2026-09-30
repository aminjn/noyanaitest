"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import { ITestify, testifyFormRenderer } from "./AdminManageTestifiesPage";

const AdminManageTestifyPage = () => {
  return (
    <NodeManager<ITestify>
      deleteBackTo="/doctorsPage?tab=testify"
      getTitle={(node) => node.name || ta("بدون نام")}
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
