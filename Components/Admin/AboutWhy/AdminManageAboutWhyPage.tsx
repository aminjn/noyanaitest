"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import { aboutWhyFormRenderer, IAboutWhy } from "./AdminManageAboutWhysPage";

const AdminManageAboutWhyPage = () => {
  return (
    <NodeManager<IAboutWhy>
      deleteBackTo="/aboutPage?tab=why"
      modelName="aboutWhy"
      getTitle={(node) => node.title || ta("بدون نام")}
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
