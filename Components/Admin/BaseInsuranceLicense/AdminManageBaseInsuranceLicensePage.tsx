"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  baseInsuranceLicenseFormRenderer,
  IBaseInsuranceLicense,
} from "./AdminManageBaseInsuranceLicensesPage";

const AdminManageBaseInsuranceLicensePage = () => {
  return (
    <NodeManager<IBaseInsuranceLicense>
      getTitle={(node) => node.displayName || ta("بدون نام")}
      modelName="baseInsuranceLicense"
      deleteBackTo="/licensePlans?tab=insurance"
      content={({ mutate, node }) => (
        <CreateForm
          defaultValue={node}
          renderer={baseInsuranceLicenseFormRenderer}
          hookProps={{
            path: `${API}/auto/baseInsuranceLicense/${node._id}`,
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

export default AdminManageBaseInsuranceLicensePage;
