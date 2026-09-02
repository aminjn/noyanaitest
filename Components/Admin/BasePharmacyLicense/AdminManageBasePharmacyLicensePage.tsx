"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  basePharmacyLicenseFormRenderer,
  IBasePharmacyLicense,
} from "./AdminManageBasePharmacyLicensesPage";

const AdminManageBasePharmacyLicensePage = () => {
  return (
    <NodeManager<IBasePharmacyLicense>
      getTitle={(node) => node.displayName || node._id}
      modelName="basePharmacyLicense"
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
