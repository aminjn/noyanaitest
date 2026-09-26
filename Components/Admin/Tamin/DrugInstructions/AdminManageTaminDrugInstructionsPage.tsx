"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { Fragment, useState } from "react";
import useSWR from "swr";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import Table from "../../UI/Table";
import { MongoDoc } from "@/Components/Hooks/useUser";
import Act from "@/Components/UI/Act";
import { Population } from "../../Clinic/AdminManageClinicsPage";

export type TaminDrugInstructionPopulation = Population<Record<never, never>>;
export interface ITaminDrugInstruction<
  T extends TaminDrugInstructionPopulation = TaminDrugInstructionPopulation
> extends MongoDoc {
  drugInstId?: string;
  drugInstCode?: string;
  drugInstSumry?: string;
  drugInstLatin?: string;
  drugInstConcept?: string;
}

const AdminManageTaminDrugInstructionsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data, error, mutate } = useSWR<ITaminDrugInstruction[]>(
    `${API}/auto/taminDrugInstruction`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="زمان مصرف"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminDrugInstructions"
              renderer={{
                drugInstId: {
                  name: "drugInstId",
                  value: (node) => node.drugInstId,
                  filter: "Text",
                },
                drugInstCode: {
                  name: "drugInstCode",
                  value: (node) => node.drugInstCode,
                  filter: "Text",
                },
                drugInstSumry: {
                  name: "drugInstSumry",
                  value: (node) => node.drugInstSumry,
                  filter: "Text",
                },
                drugInstLatin: {
                  name: "drugInstLatin",
                  value: (node) => node.drugInstLatin,
                  filter: "Text",
                },
                drugInstConcept: {
                  name: "drugInstConcept",
                  value: (node) => node.drugInstConcept,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/drugInstruction` : null}
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

export default AdminManageTaminDrugInstructionsPage;
