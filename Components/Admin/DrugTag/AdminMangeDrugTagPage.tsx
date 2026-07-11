"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDrugTag } from "./AdminManageDrugTagsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

const AdminManageDrugTagPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IDrugTag>(
    `${API}/auto/drugTag/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <CreateForm
            defaultValue={data}
            renderer={{
              name: { type: "text", title: "نام" },
              isActive: { type: "bool", title: "فعال" },
              order: { type: "number", title: "رتبه" },
            }}
            hookProps={{
              path: `${API}/auto/drugTag/${data._id}`,
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

export default AdminManageDrugTagPage;
