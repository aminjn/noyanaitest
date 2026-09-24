"use client";

import useSWR from "swr";
import classes from "./DoctorManageServicePage.module.css";
import { IService } from "./DoctorManageServicesPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { IServiceCategory } from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelService"];

const DoctorManageServicePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IService<{ Category: Record<never, never> }>
  >(nodeId ? `${API}/doctor/service/${nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("services"), target: "/doctorpanel/service" },
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
            price: { title: getContent("price"), type: "number", price: true },
            discount: {
              title: getContent("discount"),
              type: "number",
              price: true,
            },
            inventory: { title: getContent("inventory"), type: "number" },
            order: { title: getContent("order"), type: "number" },
            isActive: { title: getContent("isActive"), type: "bool" },
            isHome: { title: getContent("isHome"), type: "bool" },
            special: { title: getContent("special"), type: "bool" },
            image: { title: getContent("image"), type: "image" },
            sameAs: {
              type: "nodes",
              title: getContent("sameAs"),
              path: `${API}/doctor/service`,
              multi: true,
              getOptionLabel: (node) =>
                (node as IService).name || (node as IService)._id,
              getOptionValue: (node) => (node as IService)._id,
              getDefaultValue: (inp) => inp.sameAs,
            },
            description: { title: getContent("description"), type: "rtf" },
            whyChoose: { title: getContent("whyChoose"), type: "rtf" },
            stages: { title: getContent("stages"), type: "rtf" },
            results: { title: getContent("results"), type: "rtf" },
          }}
          hookProps={{
            path: `${API}/doctor/service/${data._id}`,
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

export default DoctorManageServicePage;
