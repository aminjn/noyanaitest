"use client";

import useSWR from "swr";
import classes from "./AdminManageBlogCategoryPage.module.css";
import { IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";

const AdminManageBlogCategoryPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlogCategory>(
    params ? `${API}/auto/blogcategory/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Box>
          <CreateForm
            defaultValue={data}
            renderer={{
              title: { title: "عنوان", type: "text" },
              slug: { title: "اسلاگ", type: "text" },
              order: { type: "number", title: "رتبه" },
            }}
            hookProps={{
              path: `${API}/auto/blogcategory/${data._id}`,
              method: "POST",
              successCb: () => mutate(),
            }}
            styleManaged
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogCategoryPage;
