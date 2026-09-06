"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IParaClinicCategory } from "./AdminManageParaClinicCategoriesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

const AdminManageParaClinicCategoryPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IParaClinicCategory>(
    `${API}/auto/paraClinicCategory/${nodeId}`,
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
              slug: { type: "text", title: "اسلاگ" },
            }}
            hookProps={{
              path: `${API}/auto/paraClinicCategory/${data._id}`,
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

export default AdminManageParaClinicCategoryPage;
