"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  aboutPartnerFormRenderer,
  IAboutPartner,
} from "./AdminManageAboutPartnersPage";

const AdminManageAboutPartnerPage = () => {
  return (
    <NodeManager<IAboutPartner>
      getTitle={(node) => node.name || node._id}
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
