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
          title="مقادیر مصرف"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              name="AdminManageTaminDrugAmounts"
              data={data}
              renderer={{
                drugAmntId: {
                  name: "drugAmntId",
                  value: (node) => node.drugAmntId,
                  filter: "Text",
                },
                drugAmntCode: {
                  name: "drugAmntCode",
                  value: (node) => node.drugAmntCode,
                  filter: "Text",
                },
                drugAmntSumry: {
                  name: "drugAmntSumry",
                  value: (node) => node.drugAmntSumry,
                  filter: "Text",
                },
                drugAmntLatin: {
                  name: "drugAmntLatin",
                  value: (node) => node.drugAmntLatin,
                  filter: "Text",
                },
                drugAmntConcept: {
                  name: "drugAmntConcept",
                  value: (node) => node.drugAmntConcept,
                  filter: "Text",
                },
                visibled: {
                  name: "visibled",
                  value: (node) => node.visibled,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/drugAmount` : null}
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
