"use client";

import { Fragment, useState } from "react";
import WithTitle from "../../UI/WithTitle";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import { MongoDoc } from "@/Components/Hooks/useUser";
import Table from "../../UI/Table";

export interface ITaminServiceType extends MongoDoc {
  srvType?: number;
  srvTypeDes?: string;
  status?: number;
  statusstDate?: string;
  custType?: number;
  prescTypeId?: number;
  headExpireDate?: number;
}

const AdminManageTaminServiceTypesPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminServiceType[]>(
    `${API}/auto/taminServiceType`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );


  


  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="سرویس تایپ"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminServiceTypes"
              renderer={{
                srvType: {
                  name: "srvType",
                  value: (node) => node.srvType,
                  filter: "Multi",
                },
                srvTypeDes: {
                  name: "srvTypeDes",
                  value: (node) => node.srvTypeDes,
                  filter: "Text",
                },
                status: {
                  name: "status",
                  value: (node) => node.status,
                  filter: "Text",
                },
                statusstDate: {
                  name: "statusstDate",
                  value: (node) => node.statusstDate,
                  filter: "Text",
                },
                custType: {
                  name: "custType",
                  value: (node) => node.custType,
                  filter: "Text",
                },
                prescTypeId: {
                  name: "prescTypeId",
                  value: (node) => node.prescTypeId,
                  filter: "Text",
                },
                headExpireDate: {
                  name: "headExpireDate",
                  value: (node) => node.headExpireDate,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/serviceType` : null}
        method="POST"
        onDone={(status) => {
          setIsRefreshing(false);
          if (!status) return;
          mutate();
        }}
      />
    </Fragment>
  );
};

export default AdminManageTaminServiceTypesPage;
