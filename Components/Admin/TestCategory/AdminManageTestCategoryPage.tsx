"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { ITestCategory } from "./AdminManageTestCategoriesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

const AdminManageTestCategoryPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<ITestCategory>(
    `${API}/auto/testCategory/${nodeId}`,
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
              isActive: { type: "bool", title: "فعال" },
              order: { type: "number", title: "رتبه" },
              slug: { type: "text", title: "اسلاگ" },
            }}
            hookProps={{
              path: `${API}/auto/testCategory/${data._id}`,
              method: "POST",
              successCb: () => mutate(),
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageTestCategoryPage;
