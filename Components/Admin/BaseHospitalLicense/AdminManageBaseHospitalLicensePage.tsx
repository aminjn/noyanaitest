"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  baseHospitalLicenseFormRenderer,
  IBaseHospitalLicense,
} from "./AdminManageBaseHospitalLicensesPage";

const AdminManageBaseHospitalLicensePage = () => {
  return (
    <NodeManager<IBaseHospitalLicense>
      getTitle={(node) => node.displayName || ta("بدون نام")}
      modelName="baseHospitalLicense"
      deleteBackTo="/licensePlans?tab=hospital"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={baseHospitalLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/baseHospitalLicense/${node._id}`,
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

export default AdminManageBaseHospitalLicensePage;
