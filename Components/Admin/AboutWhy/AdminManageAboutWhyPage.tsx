"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { aboutWhyFormRenderer, IAboutWhy } from "./AdminManageAboutWhysPage";

const AdminManageAboutWhyPage = () => {
  return (
    <NodeManager<IAboutWhy>
      modelName="aboutWhy"
      getTitle={(node) => node.title || node._id}
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={aboutWhyFormRenderer}
          hookProps={{
            path: `${API}/auto/aboutWhy/${node._id}`,
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

export default AdminManageAboutWhyPage;
