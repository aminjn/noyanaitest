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
                srvId: {
                  name: "srvId",
                  value: (node) => node.srvId,
                  filter: "Text",
                },
                srvType: {
                  name: "srvType",
                  value: (node) => node.srvType,
                  filter: "Text",
                },
                srvCode: {
                  name: "srvCode",
                  value: (node) => node.srvCode,
                  filter: "Text",
                },
                srvName: {
                  name: "srvName",
                  value: (node) => node.srvName,
                  filter: "Text",
                },
                srvName2: {
                  name: "srvName2",
                  value: (node) => node.srvName2,
                  filter: "Text",
                },
                srvBimSw: {
                  name: "srvBimSw",
                  value: (node) => node.srvBimSw,
                  filter: "Text",
                },
                srvSex: {
                  name: "srvSex",
                  value: (node) => node.srvSex,
                  filter: "Text",
                },
                srvPrice: {
                  name: "srvPrice",
                  value: (node) => node.srvPrice,
                  filter: "Text",
                },
                srvPriceDate: {
                  name: "srvPriceDate",
                  value: (node) => node.srvPriceDate,
                  filter: "Text",
                },
                doseCode: {
                  name: "doseCode",
                  value: (node) => node.doseCode,
                  filter: "Text",
                },
                formCode: {
                  name: "formCode",
                  value: (node) => node.formCode,
                  filter: "Text",
                },
                parTarefGrp: {
                  name: "parTarefGrp",
                  value: (node) => node.parTarefGrp,
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
                bGType: {
                  name: "bGType",
                  value: (node) => node.bGType,
                  filter: "Text",
                },
                gSrvCode: {
                  name: "gSrvCode",
                  value: (node) => node.gSrvCode,
                  filter: "Text",
                },
                agreementFlag: {
                  name: "agreementFlag",
                  value: (node) => node.agreementFlag,
                  filter: "Text",
                },
                isDeleted: {
                  name: "isDeleted",
                  value: (node) => node.isDeleted,
                  filter: "Text",
                },
                visible: {
                  name: "visible",
                  value: (node) => node.visible,
                  filter: "Text",
                },
                dentalServiceType: {
                  name: "dentalServiceType",
                  value: (node) => node.dentalServiceType,
                  filter: "Text",
                },
                wsSrvCode: {
                  name: "wsSrvCode",
                  value: (node) => node.wsSrvCode,
                  filter: "Text",
                },
                hosprescType: {
                  name: "hosprescType",
                  value: (node) => node.hosprescType,
                  filter: "Text",
                },
                srvRule: {
                  name: "srvRule",
                  value: (node) => node.srvRule,
                  filter: "Text",
                },
                countIsRestricted: {
                  name: "countIsRestricted",
                  value: (node) => node.countIsRestricted,
                  filter: "Text",
                },
                drugWarning: {
                  name: "drugWarning",
                  value: (node) => node.drugWarning,
                  filter: "Text",
                },
                terminology: {
                  name: "terminology",
                  value: (node) => node.terminology,
                  filter: "Text",
                },
                srvCodeComplete: {
                  name: "srvCodeComplete",
                  value: (node) => node.srvCodeComplete,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/service` : null}
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
