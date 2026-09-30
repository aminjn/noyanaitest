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
import { ta } from "@/Components/Admin/i18n/adminText";

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
          title={ta("انواع بیماری")}
          actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageTaminPhIllnesses"
              renderer={{
                illnessDesc: {
                  name: ta("عنوان"),
                  value: (node) => node.illnessDesc,
                  filter: "Text",
                },
                illnessId: {
                  name: ta("کد"),
                  value: (node) => node.illnessId,
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
