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
import { ta } from "@/Components/Admin/i18n/adminText";

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
            actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
          >
            <Table
              data={data}
              name="AdminManageTaminSpecs"
              renderer={{
                specDesc: {
                  name: ta("عنوان"),
                  value: (node) => node.specDesc,
                  filter: "Text",
                },
                specCode: {
                  name: ta("کد"),
                  value: (node) => node.specCode,
                  filter: "Text",
                },
                specGRP: {
                  name: ta("گروه"),
                  value: (node) => node.specGRP,
                  filter: "Set",
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => node.status,
                  filter: "Set",
                },
                statusstDate: {
                  name: ta("تاریخ وضعیت"),
                  value: (node) => node.statusstDate,
                  filter: "Text",
                },
                lstatus: {
                  name: ta("وضعیت (l)"),
                  value: (node) => node.lstatus,
                  filter: "Set",
                },
              }}
            />
          </WithTitle>
          <Act
            path={isRefreshing ? `${API}/admin/tamin/spec` : null}
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

export default AdminManageTaminSpecsPage;
