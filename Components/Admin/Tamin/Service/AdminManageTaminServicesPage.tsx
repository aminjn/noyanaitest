"use client";

import { Fragment, useState } from "react";
import WithTitle from "../../UI/WithTitle";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useSWR from "swr";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { Population } from "../../Clinic/AdminManageClinicsPage";

export type TaminServicePopulation = Population<Record<never, never>>;
export interface ITaminService<
  T extends TaminServicePopulation = TaminServicePopulation
> extends MongoDoc {
  srvId?: string;
  srvType?: string;
  srvCode?: string;
  srvName?: string;
  srvName2?: string;
  srvBimSw?: string;
  srvSex?: string;
  srvPrice?: string;
  srvPriceDate?: string;
  doseCode?: string;
  formCode?: string;
  parTarefGrp?: string;
  status?: string;
  statusstDate?: string;
  bGType?: string;
  gSrvCode?: string;
  agreementFlag?: string;
  isDeleted?: string;
  visible?: string;
  dentalServiceType?: string;
  wsSrvCode?: string;
  hosprescType?: string;
  srvRule?: string;
  countIsRestricted?: string;
  drugWarning?: string;
  terminology?: string;
  srvCodeComplete?: string;
}

const AdminManageTaminServicesPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data, error, mutate } = useSWR<ITaminService[]>(
    `${API}/auto/taminService`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="سرویس"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminServices"
              renderer={{
                srvName: {
                  name: "نام خدمت",
                  value: (node) => node.srvName,
                  filter: "Text",
                },
                srvCode: {
                  name: "کد خدمت",
                  value: (node) => node.srvCode,
                  filter: "Text",
                },
                srvType: {
                  name: "نوع",
                  value: (node) => node.srvType,
                  filter: "Set",
                },
                srvPrice: {
                  name: "قیمت",
                  value: (node) => node.srvPrice,
                  filter: "Text",
                },
                status: {
                  name: "وضعیت",
                  value: (node) => node.status,
                  filter: "Set",
                },
                srvId: {
                  name: "شناسه تامین",
                  value: (node) => node.srvId,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/service` : null}
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

export default AdminManageTaminServicesPage;
