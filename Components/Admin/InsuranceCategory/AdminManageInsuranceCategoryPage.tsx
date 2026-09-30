"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import {
  IInsuranceCategory,
  insuranceCategoryFormRenderer,
} from "./AdminManageInsuranceCategoriesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageInsuranceCategoryPage = () => {
  return (
    <NodeManager<IInsuranceCategory>
      getTitle={(node) => node.name || node._id}
      modelName="insuranceCategory"
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageInsuranceCategory"
          items={[
            {
              id: "Info",
              title: ta("جزئیات"),
              content: (
                <CreateForm
                  renderer={insuranceCategoryFormRenderer}
                  defaultValue={node}
                  hookProps={{
                    path: `${API}/auto/insuranceCategory/${node._id}`,
                    method: "POST",
                    successCb: () => {
                      mutate();
                    },
                  }}
                />
              ),
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageInsuranceCategoryPage;
