"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  basePharmacyLicenseFormRenderer,
  IBasePharmacyLicense,
} from "./AdminManageBasePharmacyLicensesPage";

const AdminManageBasePharmacyLicensePage = () => {
  return (
    <NodeManager<IBasePharmacyLicense>
      getTitle={(node) => node.displayName || ta("بدون نام")}
      modelName="basePharmacyLicense"
      deleteBackTo="/licensePlans?tab=pharmacy"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={basePharmacyLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/basePharmacyLicense/${node._id}`,
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

export default AdminManageBasePharmacyLicensePage;
