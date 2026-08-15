"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { IService, mutateServiceFormRenderer } from "./AdminManageServicesPage";
import TabSystem from "../UI/TabSystem";
import SpecsManager from "../Product/SpecsManager";
import ImagesManager from "../Product/ImagesManager";

const AdminManageServicePage = () => {
  return (
    <NodeManager<IService>
      modelName="service"
      getTitle={(node) => node.name || node._id}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageService"
          items={[
            {
              id: "Info",
              title: "اطلاعات",
              content: (
                <CreateForm
                  defaultValue={node}
                  hookProps={{
                    path: `${API}/auto/service/${node._id}`,
                    method: "POST",
                    successCb: () => {
                      mutate();
                    },
                  }}
                  renderer={mutateServiceFormRenderer}
                />
              ),
            },
            {
              id: "Specs",
              title: "ویژگی ها",
              content: <SpecsManager model="Service" node={node} />,
            },
            {
              id: "Images",
              content: <ImagesManager model="Service" node={node} />,
              title: "تصاویر",
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageServicePage;
