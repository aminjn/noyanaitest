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

export type TaminDrugAmountPopulation = Population<Record<never, never>>;
export interface ITaminDrugAmount<
  T extends TaminDrugAmountPopulation = TaminDrugAmountPopulation,
> extends MongoDoc {
  drugAmntId?: string;
  drugAmntCode?: string;
  drugAmntSumry?: string;
  drugAmntLatin?: string;
  drugAmntConcept?: string;
  visibled?: string;
}

const AdminManageTaminDrugAmountsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminDrugAmount[]>(
    `${API}/auto/taminDrugAmount`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
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
              name="AdminManageTaminDrugAmounts"
              data={data}
              renderer={{
                drugAmntSumry: {
                  name: ta("عنوان"),
                  value: (node) => node.drugAmntSumry,
                  filter: "Text",
                },
                drugAmntLatin: {
                  name: ta("نام لاتین"),
                  value: (node) => node.drugAmntLatin,
                  filter: "Text",
                },
                drugAmntCode: {
                  name: ta("کد"),
                  value: (node) => node.drugAmntCode,
                  filter: "Text",
                },
                drugAmntConcept: {
                  name: ta("مفهوم"),
                  value: (node) => node.drugAmntConcept,
                  filter: "Text",
                },
                visibled: {
                  name: ta("نمایش"),
                  value: (node) => node.visibled,
                  filter: "Set",
                },
                drugAmntId: {
                  name: ta("شناسه"),
                  value: (node) => node.drugAmntId,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/drugAmount` : null}
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

export default AdminManageTaminDrugAmountsPage;
