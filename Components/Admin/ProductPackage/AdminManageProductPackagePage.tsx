"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { IProductPackage } from "./AdminManageProductPackagesPage";
import { IProductCategory } from "../ProductCategory/AdminManageProductCategoriesPage";
import { IProduct } from "../Product/AdminManageProductsPage";

const AdminManageProductPackagePage = () => {
  return (
    <NodeManager<IProductPackage>
      modelName="productPackage"
      getTitle={(node) => node.name || node._id}
      content={({ mutate, node }) => (
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
                (node as IProductCategory).name ||
                (node as IProductCategory)._id,
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
          }}
        />
      )}
    />
  );
};

export default AdminManageProductPackagePage;
