"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import {
  IInsuranceTag,
  insuranceTagFormRenderer,
} from "./AdminManageInsuranceTagsPage";

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
              title: "جزئیات",
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
