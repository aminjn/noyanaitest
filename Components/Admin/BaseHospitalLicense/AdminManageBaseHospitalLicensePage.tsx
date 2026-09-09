"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import {
  baseHospitalLicenseFormRenderer,
  IBaseHospitalLicense,
} from "./AdminManageBaseHospitalLicensesPage";

const AdminManageBaseHospitalLicensePage = () => {
  return (
    <NodeManager<IBaseHospitalLicense>
      getTitle={(node) => node.displayName || node._id}
      modelName="baseHospitalLicense"
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
