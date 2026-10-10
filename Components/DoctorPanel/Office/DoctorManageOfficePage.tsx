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
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useOfficeCenterFields from "./useOfficeCenterFields";

const NS: ContentNamespace[] = ["common", "doctorPanelOffice"];

const DoctorManageOfficePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IOffice>(
    nodeId ? `${API}/doctor/office/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);
  const centerFields = useOfficeCenterFields();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("office"), target: "/doctorpanel/office" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        // one page, details and map together (fewer clicks): the pin fills
        // the address, plaque / floor / unit are typed
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={data}
          renderer={{
            name: { title: getContent("name"), type: "text", required: true, section: getContent("ofSecInfo") },
            tel: { title: getContent("telephone"), type: "text", section: getContent("ofSecInfo") },
            active: { title: getContent("isActive"), type: "bool", section: getContent("ofSecInfo") },
            order: { title: getContent("order"), type: "number", section: getContent("ofSecInfo") },
            ...(Object.fromEntries(
              Object.entries(centerFields).map(([k, v]) => [k, { ...v, section: getContent("ofSecInfo") }]),
            ) as typeof centerFields),
            location: {
              type: "point",
              title: getContent("ofMapPoint"),
              addressField: "address",
              store: "pair",
              section: getContent("ofSecLocation"),
            },
            address: { title: getContent("ofAddressAuto"), type: "area", section: getContent("ofSecLocation") },
            addressDetail: { title: getContent("ofAddressDetail"), type: "text", section: getContent("ofSecLocation") },
          }}
          hookProps={{
            path: `${API}/doctor/office/${data._id}`,
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

export default DoctorManageOfficePage;
