"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IProductCategory } from "./AdminManageProductCategoriesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

const AdminManageProductCategoryPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IProductCategory>(
    `${API}/auto/productCategory/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <CreateForm
            defaultValue={data}
            renderer={{
              name: { title: "نام", type: "text" },
              order: { title: "رتبه", type: "number" },
              isActive: { type: "bool", title: "فعال" },
            }}
            hookProps={{
              path: `${API}/auto/productCategory/${data._id}`,
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

export default AdminManageProductCategoryPage;
