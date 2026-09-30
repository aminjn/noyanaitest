"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

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
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

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
        name: { type: "text", title: ta("نام") },
        slug: { type: "text", title: ta("اسلاگ") },
        order: { type: "number", title: ta("رتبه") },
        isActive: { type: "bool", title: ta("فعال") },
        category: {
          type: "nodes",
          title: ta("دسته بندی"),
          path: `${API}/auto/productCategory`,
          creatable: { path: `${API}/auto/productCategory` },
          getOptionLabel: (node) =>
            (node as IProductCategory).name || ta("بدون نام"),
          getOptionValue: (node) => (node as IProductCategory)._id,
          getDefaultValue: (inp) => inp.category,
          multi: false,
        },
        price: { type: "number", title: ta("قیمت"), price: true },
        discount: { type: "number", title: ta("تخفیف"), price: true },
        image: { type: "image", title: ta("تصویر") },
        products: {
          type: "nodes",
          title: ta("محصولات"),
          getOptionLabel: (node) =>
            (node as IProduct).name || ta("بدون نام"),
          getOptionValue: (node) => (node as IProduct)._id,
          getDefaultValue: (inp) => inp.products,
          multi: true,
          path: `${API}/auto/product`,
        },
        description: { type: "rtf", title: ta("توضیحات") },
        summary: { type: "text", title: ta("خلاصه") },
        whyChoose: { type: "text", title: ta("چرا این محصول") },
        sameAs: {
          type: "nodes",
          title: ta("مشابهات"),
          path: `${API}/auto/productPackage`,
          getOptionLabel: (node) =>
            (node as IProductPackage).name || ta("بدون نام"),
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
      deleteBackTo="/product?tab=packages"
      getTitle={(node) => node.name || ta("بدون نام")}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageProductPackage"
          items={[
            {
              id: "Info",
              title: ta("جزئیات"),
              content: <InfoManager mutate={mutate} node={node} />,
            },
            {
              id: "Specs",
              title: ta("ویژگی ها"),
              content: <SpecsManager model="ProductPackage" node={node} />,
            },
            {
              id: "Images",
              title: ta("تصاویر"),
              content: <ImagesManager model="ProductPackage" node={node} />,
            },
            {
              id: "Meta",
              title: ta("سئو"),
              content: (
                <PageMetaEditor
                  resourceType="/productPackage/[slug]"
                  slug={node.slug}
                />
              ),
            },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="productPackage" />,
              },
            ]}
        />
      )}
    />
  );
};

export default AdminManageProductPackagePage;
