"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  baseParaClinicLicenseFormRenderer,
  IBaseParaClinicLicense,
} from "./AdminManageBaseParaClinicLicensesPage";

const AdminManageBaseParaClinicLicensePage = () => {
  return (
    <NodeManager<IBaseParaClinicLicense>
      getTitle={(node) => node.displayName || ta("بدون نام")}
      modelName="baseParaClinicLicense"
      deleteBackTo="/licensePlans?tab=paraClinic"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={baseParaClinicLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/baseParaClinicLicense/${node._id}`,
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

export default AdminManageBaseParaClinicLicensePage;
