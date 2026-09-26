"use client";

import { Fragment, useState } from "react";
import WithTitle from "../../UI/WithTitle";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

export interface ITaminIcid extends MongoDoc {
  icdId: string;
  icdCode: string;
  icdName: string;
  icdPersianName: string | null;
  countLimitation: string | null;
}

const AdminManageTaminIcidsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data, error, mutate } = useSWR<ITaminIcid[]>(
    `${API}/auto/taminIcid`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          <WithTitle
            title="icids"
            actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
          >
            <Table
              data={data}
              name="AdminManageTaminIcds"
              renderer={{
                icdId: {
                  name: "icdId",
                  value: (node) => node.icdId,
                  filter: "Text",
                },
                icdCode: {
                  name: "icdCode",
                  value: (node) => node.icdCode,
                  filter: "Text",
                },
                icdName: {
                  name: "icdName",
                  value: (node) => node.icdName,
                  filter: "Text",
                },
                countLimitation: {
                  name: "countLimitation",
                  value: (node) => node.countLimitation,
                  filter: "Text",
                },
                icdPersianName: {
                  name: "icdPresianName",
                  value: (node) => node.icdPersianName,
                  filter: "Text",
                },
              }}
            />
          </WithTitle>
          <Act
            path={isRefreshing ? `${API}/admin/tamin/icid` : null}
        method="POST"
            onDone={(status, result) => {
              setIsRefreshing(false);
              if (!status) return;
              console.log(result);
              mutate();
            }}
          />
        </Fragment>
      )}
    </HandleLoading>
  );
};

export default AdminManageTaminIcidsPage;
