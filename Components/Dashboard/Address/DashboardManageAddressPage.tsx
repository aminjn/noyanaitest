"use client";

import useSWR from "swr";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import classes from "./DashboardManageAddressPage.module.css";
import { IUserAddress } from "./DashboardManageAddressesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import DashboardManageAddressLocationTab from "./DashboardManageAddressLocationTab";

const NS: ContentNamespace[] = ["common", "dashboardAddress"];

const DashboardManageAddressPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IUserAddress>(
    nodeId ? `${API}/user/address/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);
  // the addresses list links "pin on map" here with ?tab=Location
  const tabState = useState<string>(useSearchParams().get("tab") === "Location" ? "Location" : "Details");

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <ClientTabSystem
            viewState={tabState}
            items={[
              {
                id: "Details",
                title: getContent("details"),
                content: (
                  <CreateForm
                    style={{ width: "100%" }}
                    defaultValue={data}
                    renderer={{
                      displayName: {
                        title: getContent("displayName"),
                        type: "text",
                      },
                      address: {
                        title: getContent("address"),
                        type: "text",
                      },
                    }}
                    hookProps={{
                      path: `${API}/user/address/${data._id}`,
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
                  <DashboardManageAddressLocationTab
                    mutate={mutate}
                    address={data}
                  />
                ),
              },
            ]}
          />
        )}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageAddressPage;
