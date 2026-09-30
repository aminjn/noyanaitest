"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Fragment, useState } from "react";
import useSWR from "swr";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import Table from "../../UI/Table";
import Act from "@/Components/UI/Act";
import { Population } from "../../Clinic/AdminManageClinicsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

export type TaminDrugUsagePopulation = Population<Record<never, never>>;

export interface ITaminDrugUsage<
  T extends TaminDrugUsagePopulation = TaminDrugUsagePopulation
> extends MongoDoc {
  drugUsageId?: string;
  drugUsageCode?: string;
  drugUsageSumry?: string;
  drugUsageLatin?: string;
  drugUsageConcept?: string;
  visible?: string;
  drugFormCode?: string;
}

const AdminManageTaminDrugUsagesPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminDrugUsage[]>(
    `${API}/auto/taminDrugUsage`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title={ta("مقادیر مصرف")}
          actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminDrugUsages"
              renderer={{
                drugUsageSumry: {
                  name: ta("شرح مصرف"),
                  value: (node) => node.drugUsageSumry,
                  filter: "Text",
                },
                drugUsageLatin: {
                  name: ta("عنوان لاتین"),
                  value: (node) => node.drugUsageLatin,
                  filter: "Text",
                },
                drugUsageConcept: {
                  name: ta("مفهوم"),
                  value: (node) => node.drugUsageConcept,
                  filter: "Text",
                },
                drugUsageCode: {
                  name: ta("کد"),
                  value: (node) => node.drugUsageCode,
                  filter: "Text",
                },
                drugFormCode: {
                  name: ta("کد شکل دارویی"),
                  value: (node) => node.drugFormCode,
                  filter: "Set",
                },
                visible: {
                  name: ta("نمایش"),
                  value: (node) => node.visible,
                  filter: "Set",
                },
                drugUsageId: {
                  name: ta("شناسه تامین"),
                  value: (node) => node.drugUsageId,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/drugUsage` : null}
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

export default AdminManageTaminDrugUsagesPage;
