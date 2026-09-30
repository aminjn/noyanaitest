"use client";

import useSWR from "swr";
import classes from "./AdminManageBlogCategoryPage.module.css";
import { IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import Box from "../UI/Box";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

export const blogCategoryFormRenderer: FormRenderer<IBlogCategory> = {
  title: { get title() {
  return ta("عنوان");
}, type: "text" },
  slug: { get title() {
  return ta("اسلاگ");
}, type: "text" },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
};

const AdminManageBlogCategoryPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlogCategory>(
    params ? `${API}/auto/blogcategory/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Box>
          <CreateForm
            readOnly={!hasAccess("BlogCategory", "update")}
            defaultValue={data}
            renderer={blogCategoryFormRenderer}
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
