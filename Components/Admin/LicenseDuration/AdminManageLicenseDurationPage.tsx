"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { ILicenseDuration } from "./AdminManageLicenseDurationsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

const AdminManageLicenseDurationPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<ILicenseDuration>(
    `${API}/auto/licenseDuration/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.displayName || data._id}>
          <CreateForm
            defaultValue={data}
            renderer={{
              displayName: { type: "text", title: "نام نمایشی" },
              duration: { type: "number", title: "مدت (روز)" },
              order: { type: "number", title: "رتبه" },
            }}
            hookProps={{
              path: `${API}/auto/licenseDuration/${data._id}`,
              method: "POST",
              successCb: () => {
                mutate();
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageLicenseDurationPage;
