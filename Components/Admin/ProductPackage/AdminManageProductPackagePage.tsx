"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { IProductPackage } from "./AdminManageProductPackagesPage";
import { IProductCategory } from "../ProductCategory/AdminManageProductCategoriesPage";
import { IProduct, IProductSpec } from "../Product/AdminManageProductsPage";
import TabSystem from "../UI/TabSystem";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import SpecsManager from "../Product/SpecsManager";
import ImagesManager from "../Product/ImagesManager";

const InfoManager = ({
  mutate,
  node,
}: {
  node: IProductPackage;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/productPackage/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      renderer={{
        name: { type: "text", title: "نام" },
        slug: { type: "text", title: "اسلاگ" },
        order: { type: "number", title: "رتبه" },
        isActive: { type: "bool", title: "فعال" },
        category: {
          type: "nodes",
          title: "دسته بنذی",
          path: `${API}/auto/productCategory`,
          getOptionLabel: (node) =>
            (node as IProductCategory).name || (node as IProductCategory)._id,
          getOptionValue: (node) => (node as IProductCategory)._id,
          getDefaultValue: (inp) => inp.category,
          multi: false,
        },
        price: { type: "number", title: "فیمت" },
        discount: { type: "number", title: "تخفیف" },
        image: { type: "image", title: "تصویر" },
        products: {
          type: "nodes",
          title: "محصولات",
          getOptionLabel: (node) =>
            (node as IProduct).name || (node as IProduct)._id,
          getOptionValue: (node) => (node as IProduct)._id,
          getDefaultValue: (inp) => inp.products,
          multi: true,
          path: `${API}/auto/product`,
        },
        description: { type: "rtf", title: "توضیحات" },
        summary: { type: "text", title: "خلاصه" },
        whyChoose: { type: "text", title: "چرا این محصول" },
        sameAs: {
          type: "nodes",
          title: "مشابهات",
          path: `${API}/auto/productPackage`,
          getOptionLabel: (node) =>
            (node as IProductPackage).name || (node as IProductPackage)._id,
          getOptionValue: (node) => (node as IProductPackage)._id,
          getDefaultValue: (inp) => inp.sameAs,
          multi: true,
        },
      }}
    />
  );
};

const AdminManageProductPackagePage = () => {
  return (
    <NodeManager<IProductPackage>
      modelName="productPackage"
      getTitle={(node) => node.name || node._id}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageProductPackage"
          items={[
            {
              id: "Info",
              title: "جزئیات",
              content: <InfoManager mutate={mutate} node={node} />,
            },
            {
              id: "Specs",
              title: "ویژگی ها",
              content: <SpecsManager model="ProductPackage" node={node} />,
            },
            {
              id: "Images",
              title: "تصویر",
              content: <ImagesManager model="ProductPackage" node={node} />,
            },
          ]}
        />
      )}
    />
  );
};

export default AdminManageProductPackagePage;
