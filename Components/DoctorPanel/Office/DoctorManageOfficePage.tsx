"use client";

import useSWR from "swr";
import classes from "./DoctorManageOfficePage.module.css";
import { IOffice } from "./DoctorManageOfficesPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import DoctorManageOfficeLocationTab from "./DoctorManageOfficeLocationTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelOffice"];

const DoctorManageOfficePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IOffice>(
    nodeId ? `${API}/doctor/office/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("office"), target: "/doctorpanel/office" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <ClientTabSystem
          items={[
            {
              id: "Details",
              title: getContent("details"),
              content: (
                <CreateForm
                  style={{ width: "100%" }}
                  defaultValue={data}
                  renderer={{
                    name: { title: getContent("name"), type: "text" },
                    address: { title: getContent("address"), type: "text" },
                    tel: { title: getContent("telephone"), type: "text" },
                    order: { title: getContent("order"), type: "number" },
                    active: { title: getContent("isActive"), type: "bool" },
                  }}
                  hookProps={{
                    path: `${API}/doctor/office/${data._id}`,
                    method: "POST",
                    successCb: () => {
                      mutate();
                    },
                  }}
                />
              ),
            },
            {
              id: "Location",
              title: getContent("location"),
              content: (
                <DoctorManageOfficeLocationTab mutate={mutate} office={data} />
              ),
            },
          ]}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorManageOfficePage;
