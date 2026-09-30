"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  baseDoctorLicenseFormRenderer,
  IBaseDoctorLicense,
} from "./AdminManageBaseDoctorLicensesPage";

const AdminManageBaseDoctorLicensePage = () => {
  return (
    <NodeManager<IBaseDoctorLicense>
      getTitle={(node) => node.displayName || ta("بدون نام")}
      modelName="baseDoctorLicense"
      deleteBackTo="/licensePlans?tab=doctor"
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
