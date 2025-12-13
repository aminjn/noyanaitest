"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Fragment, useState } from "react";
import useSWR from "swr";
import Table from "../../UI/Table";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import Act from "@/Components/UI/Act";

export interface ITaminParTaref extends MongoDoc {
  parGrpCode?: string;
  parGrpDesc?: string;
  parGrpRem?: string;
  status?: string;
  statusStDate?: string;
}

const AdminManageTaminParTarefsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminParTaref[]>(
    `${API}/auto/taminParTaref`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <Fragment>
      <HandleLoading data={!!data} error={error}>
        <WithTitle
          title="زیر گروه نسخ آزمایش"
          actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminParTarefs"
              renderer={{
                parGrpCode: {
                  name: "parGrpCode",
                  value: (node) => node.parGrpCode,
                  filter: "Text",
                },
                parGrpDesc: {
                  name: "parGrpDesc",
                  value: (node) => node.parGrpDesc,
                  filter: "Text",
                },
                parGrpRem: {
                  name: "parGrpRem",
                  value: (node) => node.parGrpRem,
                  filter: "Text",
                },
                status: {
                  name: "status",
                  value: (node) => node.status,
                  filter: "Text",
                },
                statusStDate: {
                  name: "statusStDate",
                  value: (node) => node.statusStDate,
                  filter: "Text",
                },
              }}
            />
          )}
        </WithTitle>
      </HandleLoading>
      <Act
        path={isRefreshing ? `${API}/admin/tamin/parTaref` : null}
        onDone={(status) => {
          setIsRefreshing(false);
          if (!status) return;
          mutate();
        }}
      />
    </Fragment>
  );
};

export default AdminManageTaminParTarefsPage;
