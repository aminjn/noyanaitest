"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import {
  IInsuranceTag,
  insuranceTagFormRenderer,
} from "./AdminManageInsuranceTagsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageInsuranceTagPage = () => {
  return (
    <NodeManager<IInsuranceTag>
      getTitle={(node) => node.name || node._id}
      modelName="insuranceTag"
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageInsuranceTag"
          items={[
            {
              id: "Info",
              title: ta("جزئیات"),
              content: (
                <CreateForm
                  defaultValue={node}
                  renderer={insuranceTagFormRenderer}
                  hookProps={{
                    path: `${API}/auto/insuranceTag/${node._id}`,
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

export default AdminManageInsuranceTagPage;
