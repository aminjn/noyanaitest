"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  baseParaClinicLicenseFormRenderer,
  IBaseParaClinicLicense,
} from "./AdminManageBaseParaClinicLicensesPage";

const AdminManageBaseParaClinicLicensePage = () => {
  return (
    <NodeManager<IBaseParaClinicLicense>
      getTitle={(node) => node.displayName || node._id}
      modelName="baseParaClinicLicense"
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
