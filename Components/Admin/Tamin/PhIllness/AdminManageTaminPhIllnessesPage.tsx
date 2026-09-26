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

export interface ITaminPhIllness extends MongoDoc {
  illnessId?: string;
  illnessDesc?: string;
}

const AdminManageTaminPhIllnessesPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminPhIllness[]>(
    `${API}/auto/taminPhIllness`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="انواع بیماری"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminPhIllnesses"
              renderer={{
                illnessId: {
                  name: "illnessId",
                  value: (node) => node.illnessId,
                  filter: "Text",
                },
                illnessDesc: {
                  name: "illnessDesc",
                  value: (node) => node.illnessDesc,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/phIllness` : null}
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

export default AdminManageTaminPhIllnessesPage;
