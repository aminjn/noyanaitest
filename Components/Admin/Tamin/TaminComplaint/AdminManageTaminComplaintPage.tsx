"use client";

import useSWR from "swr";
import WithTitle from "../../UI/WithTitle";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import { ta } from "@/Components/Admin/i18n/adminText";

export interface ITaminComplaint extends MongoDoc {
  taminId: number;
  code: number;
  displayName: string;
  englishName: string;
  terminology: string;
  status: string;
}

const AdminManageTaminComplaintsPage = () => {
  const { data, error, mutate } = useSWR<ITaminComplaint[]>(
    `${API}/auto/taminComplaint`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          <WithTitle
            title="complaints"
            actions={[{ title: ta("رفرش"), action: () => setIsRefreshing(true) }]}
          >
            <Table
              data={data}
              name="AdminManageTaminComplaints"
              renderer={{
                displayName: {
                  name: ta("نام"),
                  value: (node) => node.displayName,
                  filter: "Text",
                },
                englishName: {
                  name: ta("نام انگلیسی"),
                  value: (node) => node.englishName,
                  filter: "Text",
                },
                code: {
                  name: ta("کد"),
                  value: (node) => node.code,
                  filter: "Text",
                },
                terminology: {
                  name: ta("ترمینولوژی"),
                  value: (node) => node.terminology,
                  filter: "Set",
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => node.status,
                  filter: "Set",
                },
                taminId: {
                  name: ta("شناسه تامین"),
                  value: (node) => node.taminId,
                  filter: "Text",
                },
              }}
            />
          </WithTitle>
          <Act
            path={isRefreshing ? `${API}/admin/tamin/complaint` : null}
        method="POST"
            onDone={(status, result) => {
              setIsRefreshing(false);
              if (!status) return;
              console.log(result);
              mutate();
            }}
            initMessage="initMessage"
            successMessage="Success"
            errorMessage="Error"
          />
        </Fragment>
      )}
    </HandleLoading>
  );
};

export default AdminManageTaminComplaintsPage;
