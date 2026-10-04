"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import { API } from "@/Components/config";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import AdminRecordEditor from "../UI/AdminRecordEditor";
import { useParams } from "next/navigation";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
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

// The bundle's record fields: its details tab and, with its owner, the one
// form of a new bundle (`/productPackage/new`)
const productPackageInfoRenderer = (
  withOwner?: boolean,
): FormRenderer<IProductPackage> => ({
  ...(withOwner
    ? {
        owner: {
          type: "nodes" as const,
          title: ta("صاحب"),
          path: `${API}/auto/pharmacy`,
          getOptionLabel: (node: unknown) =>
            (node as IPharmacy).name || ta("بدون نام"),
          getOptionValue: (node: unknown) => (node as IPharmacy)._id,
          multi: false,
          required: true,
        },
      }
    : {}),
  name: { type: "text", title: ta("نام"), required: true },
  slug: { type: "text", title: ta("اسلاگ") },
  order: { type: "number", title: ta("رتبه") },
  isActive: { type: "bool", title: ta("فعال") },
  category: {
    type: "nodes",
    title: ta("دسته بندی"),
    path: `${API}/auto/productCategory`,
    creatable: { path: `${API}/auto/productCategory` },
    getOptionLabel: (node) => (node as IProductCategory).name || ta("بدون نام"),
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
    getOptionLabel: (node) => (node as IProduct).name || ta("بدون نام"),
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
    getOptionLabel: (node) => (node as IProductPackage).name || ta("بدون نام"),
    getOptionValue: (node) => (node as IProductPackage)._id,
    getDefaultValue: (inp) => inp.sameAs,
    multi: true,
  },
});

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
      renderer={productPackageInfoRenderer()}
    />
  );
};

const ProductPackageRecordPage = () => {
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

// "New" is this route with `new`: the owner and every field in one form,
// saved once (Components/Admin/UI/AdminRecordEditor), then this page with
// its specs and images
const AdminManageProductPackagePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IProductPackage>
        segment="productPackage"
        path="/productPackage"
        nodeId="new"
        newTitle={ta("بسته‌ی محصول جدید")}
        titleOf={(node) => node.name || ""}
        renderer={productPackageInfoRenderer(true)}
      />
    );
  return <ProductPackageRecordPage />;
};

export default AdminManageProductPackagePage;
