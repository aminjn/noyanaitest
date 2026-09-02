"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  baseClinicLicenseFormRenderer,
  IBaseClinicLicense,
} from "./AdminManageBaseClinicLicensesPage";

const AdminManageBaseClinicLicensePage = () => {
  return (
    <NodeManager<IBaseClinicLicense>
      getTitle={(node) => node.displayName || node._id}
      modelName="baseClinicLicense"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={baseClinicLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/baseClinicLicense/${node._id}`,
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

export default AdminManageBaseClinicLicensePage;
