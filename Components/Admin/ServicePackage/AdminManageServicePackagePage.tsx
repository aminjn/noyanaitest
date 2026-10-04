"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import { API } from "@/Components/config";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import AdminRecordEditor from "../UI/AdminRecordEditor";
import { useParams } from "next/navigation";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import NodeManager from "../UI/NodeManger";
import TabSystem from "../UI/TabSystem";
import { IServicePackage } from "./AdminManageServicePackagesPage";
import { IServiceCategory } from "../ServiceCategory/AdminManageServiceCategoriesPage";
import { IService } from "../Service/AdminManageServicesPage";
import SpecsManager from "../Product/SpecsManager";
import ImagesManager from "../Product/ImagesManager";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const idOf = (value: unknown) =>
  value && typeof value === "object"
    ? String((value as { _id?: string })._id || "")
    : String(value || "");

// The package's record fields: its info tab and, with its owner, the one
// form of a new package (`/servicePackage/new`)
const servicePackageInfoRenderer = (
  withOwner?: boolean,
): FormRenderer<IServicePackage> => ({
  ...(withOwner
    ? {
        owner: {
          type: "nodes" as const,
          title: ta("صاحب"),
          path: `${API}/auto/doctorProfile`,
          getOptionLabel: (node: unknown) =>
            getDoctorProfileLabel(node as IDoctorProfile),
          getOptionValue: (node: unknown) => (node as IDoctorProfile)._id,
          multi: false,
          required: true,
        },
      }
    : {}),
  name: { type: "text", title: ta("نام"), required: true },
  isActive: { type: "bool", title: ta("فعال") },
  order: { type: "number", title: ta("رتبه") },
  price: { type: "number", title: ta("قیمت"), price: true },
  discount: { type: "number", title: ta("تخفیف"), price: true },
  category: {
    type: "nodes",
    title: ta("دسته بندی"),
    path: `${API}/auto/serviceCategory`,
    creatable: { path: `${API}/auto/serviceCategory`, field: "title" },
    multi: false,
    getOptionLabel: (node) =>
      (node as IServiceCategory).title || ta("بدون نام"),
    getOptionValue: (node) => (node as IServiceCategory)._id,
    getDefaultValue: (inp) => inp.category,
  },
  services: {
    type: "nodes",
    title: ta("اقلام"),
    getOptionLabel: (node) => (node as IService).name || ta("بدون نام"),
    getOptionValue: (node) => (node as IService)._id,
    getDefaultValue: (inp) => inp.services,
    // the owner's own services
    path: (values) => `${API}/auto/service?owner=${idOf(values.owner)}`,
    multi: true,
  },
  image: { type: "image", title: ta("تصویر") },
  slug: { type: "text", title: ta("اسلاگ") },
  description: { type: "rtf", title: ta("توضیحات") },
  results: { type: "rtf", title: ta("نتایج") },
  stages: { type: "rtf", title: ta("مراحل انجام") },
  whyChoose: { type: "rtf", title: ta("چرا این") },
  sameAs: {
    type: "nodes",
    title: ta("مشابهات"),
    path: `${API}/auto/servicePackage`,
    getOptionLabel: (node) => (node as IServicePackage).name || ta("بدون نام"),
    getOptionValue: (node) => (node as IServicePackage)._id,
    getDefaultValue: (inp) => inp.sameAs,
    multi: true,
  },
  summary: { type: "text", title: ta("خلاصه") },
});

const ServicePackageRecordPage = () => {
  return (
    <NodeManager<IServicePackage>
      modelName="servicePackage"
      deleteBackTo="/service?tab=packages"
      getTitle={(node) => node.name || ta("بدون نام")}
      content={({ mutate, node }) => (
        <TabSystem
          name="AdminManageServicePackage"
          items={[
            {
              id: "Info",
              title: ta("اطلاعات"),
              content: (
                <CreateForm
                  defaultValue={node}
                  renderer={servicePackageInfoRenderer()}
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
              title: ta("ویژگی ها"),
              content: <SpecsManager model="ServicePackage" node={node} />,
            },
            {
              id: "Images",
              title: ta("تصاویر"),
              content: <ImagesManager model="ServicePackage" node={node} />,
            },
            {
              id: "Meta",
              title: ta("سئو"),
              content: (
                <PageMetaEditor
                  resourceType="/servicePackage/[slug]"
                  slug={node.slug}
                />
              ),
            },
            {
              id: "translations",
              title: ta("ترجمه‌ها"),
              content: <AdminContentTranslationPage segment="servicePackage" />,
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
const AdminManageServicePackagePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IServicePackage>
        segment="servicePackage"
        path="/servicePackage"
        nodeId="new"
        newTitle={ta("بسته‌ی خدمت جدید")}
        titleOf={(node) => node.name || ""}
        renderer={servicePackageInfoRenderer(true)}
      />
    );
  return <ServicePackageRecordPage />;
};

export default AdminManageServicePackagePage;
