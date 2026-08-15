"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import { IServicePackage } from "./AdminManageServicePackagesPage";
import { IServiceCategory } from "../ServiceCategory/AdminManageServiceCategoriesPage";
import { IService } from "../Service/AdminManageServicesPage";
import SpecsManager from "../Product/SpecsManager";
import ImagesManager from "../Product/ImagesManager";
import PageMetaEditor from "../PageMeta/PageMetaEditor";

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
                    slug: { type: "text", title: "اسلاگ" },
                    description: { type: "rtf", title: "توضیحات" },
                    results: { type: "rtf", title: "نتایج" },
                    stages: { type: "rtf", title: "مراحل انجام" },
                    whyChoose: { type: "rtf", title: "چرا این" },
                    sameAs: {
                      type: "nodes",
                      title: "مشابهات",
                      path: `${API}/auto/servicePackage`,
                      getOptionLabel: (node) =>
                        (node as IServicePackage).name ||
                        (node as IServicePackage)._id,
                      getOptionValue: (node) => (node as IServicePackage)._id,
                      getDefaultValue: (inp) => inp.sameAs,
                      multi: true,
                    },
                    summary: { type: "text", title: "خلاصه" },
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
            {
              id: "Specs",
              title: "ویژگی ها",
              content: <SpecsManager model="ServicePackage" node={node} />,
            },
            {
              id: "Images",
              title: "تصاویر",
              content: <ImagesManager model="ServicePackage" node={node} />,
            },
            {
              id: "Meta",
              title: "متادیتا",
              content: (
                <PageMetaEditor
                  resourceType="/servicePackage/[slug]"
                  slug={node.slug}
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
