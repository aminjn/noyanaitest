"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import { IServicePackage } from "./AdminManageServicePackagesPage";
import { IServiceCategory } from "../ServiceCategory/AdminManageServiceCategoriesPage";
import { IService } from "../Service/AdminManageServicesPage";

const AdminManageServicePackagePage = () => {
  return (
    <NodeManager<IServicePackage>
      modelName="servicePackage"
      getTitle={(node) => node.name || node._id}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageServicePackage"
          items={[
            {
              id: "Info",
              title: "اطلاعات",
              content: (
                <CreateForm
                  defaultValue={node}
                  renderer={{
                    name: { type: "text", title: "نام" },
                    isActive: { type: "bool", title: "فعال" },
                    order: { type: "number", title: "رتبه" },
                    price: { type: "number", title: "فیمت" },
                    discount: { type: "number", title: "تخفیف" },
                    category: {
                      type: "nodes",
                      title: "دسته بندی",
                      path: `${API}/auto/serviceCategory`,
                      multi: false,
                      getOptionLabel: (node) =>
                        (node as IServiceCategory).title ||
                        (node as IServiceCategory)._id,
                      getOptionValue: (node) => (node as IServiceCategory)._id,
                      getDefaultValue: (inp) => inp.category,
                    },
                    services: {
                      type: "nodes",
                      title: "اقلام",
                      getOptionLabel: (node) =>
                        (node as IService).name || (node as IService)._id,
                      getOptionValue: (node) => (node as IService)._id,
                      getDefaultValue: (inp) => inp.services,
                      path: `${API}/auto/service?owner=${node.owner}`,
                      multi: true,
                    },
                    image: { type: "image", title: "تصویر" },
                  }}
                  hookProps={{
                    path: `${API}/auto/servicePackage/${node._id}`,
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

export default AdminManageServicePackagePage;
