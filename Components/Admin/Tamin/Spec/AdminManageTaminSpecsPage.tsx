"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import HandleLoading from "../../UI/HandleLoading";
import { Fragment, useState } from "react";
import WithTitle from "../../UI/WithTitle";
import Table from "../../UI/Table";
import Act from "@/Components/UI/Act";

export interface ITaminSpec extends MongoDoc {
  specCode: string;
  specDesc: string;
  specGRP: string;
  docComment: null;
  status: string;
  statusstDate: string;
  typeSpec: null;
  maxNormal: null;
  maxSpecial: null;
  lstatus: string;
}

const AdminManageTaminSpecsPage = () => {
  const { data, error, mutate } = useSWR<ITaminSpec[]>(
    `${API}/auto/taminSpec`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          <WithTitle
            title="Specs"
            actions={[{ title: "رفرش", action: () => setIsRefreshing(true) }]}
          >
            <Table
              data={data}
              name="AdminManageTaminSpecs"
              renderer={{
                specCode: {
                  name: "specCode",
                  value: (node) => node.specCode,
                  filter: "Text",
                },
                specDesc: {
                  name: "specDesc",
                  value: (node) => node.specDesc,
                  filter: "Text",
                },
                specGRP: {
                  name: "specGRP",
                  value: (node) => node.specGRP,
                  filter: "Text",
                },
                docComment: {
                  name: "docComment",
                  value: (node) => node.docComment,
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
                typeSpec: {
                  name: "typeSpec",
                  value: (node) => node.typeSpec,
                  filter: "Text",
                },
                maxNormal: {
                  name: "maxNormal",
                  value: (node) => node.maxNormal,
                  filter: "Text",
                },
                maxSpecial: {
                  name: "maxSpecial",
                  value: (node) => node.maxSpecial,
                  filter: "Text",
                },
                lstatus: {
                  name: "lstatus",
                  value: (node) => node.lstatus,
                  filter: "Text",
                },
              }}
            />
          </WithTitle>
          <Act
            path={isRefreshing ? `${API}/admin/tamin/spec` : null}
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

export default AdminManageTaminSpecsPage;
