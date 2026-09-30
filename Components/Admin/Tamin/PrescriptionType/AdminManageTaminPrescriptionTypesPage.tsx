"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import WithTitle from "../../UI/WithTitle";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../../Clinic/AdminManageClinicsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

export type TaminPrescriptionTypePopulation = Population<Record<never, never>>;
export interface ITaminPrescriptionType<
  T extends TaminPrescriptionTypePopulation = TaminPrescriptionTypePopulation,
> extends MongoDoc {
  prescTypeId?: number;
  prescTypeCode?: string;
  prescTypeDesc?: string;
}

const AdminManageTaminPrescriptionTypesPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data, error, mutate } = useSWR<ITaminPrescriptionType[]>(
    `${API}/auto/taminPrescriptionType`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title={ta("انواع نسخه")}
          actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminPrescriptionTypes"
              renderer={{
                prescTypeDesc: {
                  name: ta("عنوان"),
                  value: (node) => node.prescTypeDesc,
                  filter: "Text",
                },
                prescTypeCode: {
                  name: ta("کد"),
                  value: (node) => node.prescTypeCode,
                  filter: "Text",
                },
                prescTypeId: {
                  name: ta("شناسه تامین"),
                  value: (node) => node.prescTypeId,
                  filter: "Number",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/prescriptionType` : null}
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

export default AdminManageTaminPrescriptionTypesPage;
