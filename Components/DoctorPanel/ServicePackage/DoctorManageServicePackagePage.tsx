"use client";

import useSWR from "swr";
import classes from "./DoctorManageServicePackagePage.module.css";
import { IServicePackage } from "./DoctorManageServicePackagesPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { IServiceCategory } from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { IService } from "../Service/DoctorManageServicesPage";

const DoctorManageServicePackagePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IServicePackage<{
      Category: Record<never, never>;
      Services: Record<never, never>;
    }>
  >(nodeId ? `${API}/doctor/servicepackage/${nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    {
      title: getContent("servicePackages"),
      target: "/doctorpanel/servicepackage",
    },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={data}
          renderer={{
            name: { title: getContent("name"), type: "text" },
            category: {
              type: "nodes",
              title: getContent("category"),
              path: `${API}/public/selectservicecategory`,
              multi: false,
              clearable: true,
              getOptionLabel: (node) =>
                (node as IServiceCategory).title ||
                (node as IServiceCategory)._id,
              getOptionValue: (node) => (node as IServiceCategory)._id,
              getDefaultValue: (node) => node.category?._id,
            },
            services: {
              type: "nodes",
              title: getContent("services"),
              path: `${API}/doctor/service`,
              multi: true,
              getOptionLabel: (node) =>
                (node as IService).name || (node as IService)._id,
              getOptionValue: (node) => (node as IService)._id,
              getDefaultValue: (inp) => inp.services.map((s) => s._id),
            },
            price: { title: getContent("price"), type: "number", price: true },
            discount: {
              title: getContent("discount"),
              type: "number",
              price: true,
            },
            order: { title: getContent("order"), type: "number" },
            isActive: { title: getContent("isActive"), type: "bool" },
            image: { title: getContent("image"), type: "image" },
            sameAs: {
              type: "nodes",
              title: getContent("sameAs"),
              path: `${API}/doctor/servicepackage`,
              multi: true,
              getOptionLabel: (node) =>
                (node as IServicePackage).name || (node as IServicePackage)._id,
              getOptionValue: (node) => (node as IServicePackage)._id,
              getDefaultValue: (inp) => inp.sameAs,
            },
            summary: { title: getContent("summary"), type: "text" },
            description: { title: getContent("description"), type: "rtf" },
            whyChoose: { title: getContent("whyChoose"), type: "rtf" },
            stages: { title: getContent("stages"), type: "rtf" },
            results: { title: getContent("results"), type: "rtf" },
          }}
          hookProps={{
            path: `${API}/doctor/servicepackage/${data._id}`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorManageServicePackagePage;
