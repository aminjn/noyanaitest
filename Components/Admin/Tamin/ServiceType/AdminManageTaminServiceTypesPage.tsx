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
import { ta } from "@/Components/Admin/i18n/adminText";

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
          title={ta("سرویس تایپ")}
          actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminServiceTypes"
              renderer={{
                srvTypeDes: {
                  name: ta("شرح نوع خدمت"),
                  value: (node) => node.srvTypeDes,
                  filter: "Text",
                },
                srvType: {
                  name: ta("کد نوع خدمت"),
                  value: (node) => node.srvType,
                  filter: "Multi",
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => node.status,
                  filter: "Set",
                },
                custType: {
                  name: ta("نوع مشتری"),
                  value: (node) => node.custType,
                  filter: "Set",
                },
                prescTypeId: {
                  name: ta("نوع نسخه"),
                  value: (node) => node.prescTypeId,
                  filter: "Set",
                },
                statusstDate: {
                  name: ta("تاریخ وضعیت"),
                  value: (node) => node.statusstDate,
                  filter: "Text",
                },
                headExpireDate: {
                  name: ta("انقضای سرنسخه"),
                  value: (node) => node.headExpireDate,
                  filter: "Number",
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
