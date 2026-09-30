"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import {
  IPrivacySection,
  privacySectionFormRenderer,
} from "./AdminManagePrivacySectionsPage";

const AdminManagePrivacySectionPage = () => {
  return (
    <NodeManager<IPrivacySection>
      deleteBackTo="/privacy"
      modelName="privacySection"
      getTitle={(node) => node.title || ta("بدون نام")}
      content={({ mutate, node }) => (
        <CreateForm
          renderer={privacySectionFormRenderer}
          defaultValue={node}
          hookProps={{
            path: `${API}/auto/privacySection/${node._id}`,
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

export default AdminManagePrivacySectionPage;
