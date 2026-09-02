"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  baseDoctorLicenseFormRenderer,
  IBaseDoctorLicense,
} from "./AdminManageBaseDoctorLicensesPage";

const AdminManageBaseDoctorLicensePage = () => {
  return (
    <NodeManager<IBaseDoctorLicense>
      getTitle={(node) => node.displayName || node._id}
      modelName="baseDoctorLicense"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={baseDoctorLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/baseDoctorLicense/${node._id}`,
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

export default AdminManageBaseDoctorLicensePage;
