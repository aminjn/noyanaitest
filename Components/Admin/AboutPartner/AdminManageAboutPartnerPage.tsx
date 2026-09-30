"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import {
  aboutPartnerFormRenderer,
  IAboutPartner,
} from "./AdminManageAboutPartnersPage";

const AdminManageAboutPartnerPage = () => {
  return (
    <NodeManager<IAboutPartner>
      deleteBackTo="/aboutPage?tab=partners"
      getTitle={(node) => node.name || ta("بدون نام")}
      modelName="aboutPartner"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={aboutPartnerFormRenderer}
          hookProps={{
            path: `${API}/auto/aboutPartner/${node._id}`,
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

export default AdminManageAboutPartnerPage;
