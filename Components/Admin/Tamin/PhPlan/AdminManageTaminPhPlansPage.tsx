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

export interface ITaminPhPlan extends MongoDoc {
  planId?: string;
  planDesc?: string;
  planCode?: string;
}

const AdminManageTaminPhPlansPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminPhPlan[]>(
    `${API}/auto/taminPhPlan`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="طرح درمان"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminPhPlans"
              renderer={{
                planId: {
                  name: "planId",
                  value: (node) => node.planId,
                  filter: "Text",
                },
                planDesc: {
                  name: "planDesc",
                  value: (node) => node.planDesc,
                  filter: "Text",
                },
                planCode: {
                  name: "planCode",
                  value: (node) => node.planCode,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/phPlan` : null}
        onDone={(status) => {
          setIsRefreshing(false);
          if (!status) return;
          mutate();
        }}
      />
    </Fragment>
  );
};

export default AdminManageTaminPhPlansPage;
