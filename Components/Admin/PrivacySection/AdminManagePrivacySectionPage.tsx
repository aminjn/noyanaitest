"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  IPrivacySection,
  privacySectionFormRenderer,
} from "./AdminManagePrivacySectionsPage";

const AdminManagePrivacySectionPage = () => {
  return (
    <NodeManager<IPrivacySection>
      modelName="privacySection"
      getTitle={(node) => node.title || node._id}
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
