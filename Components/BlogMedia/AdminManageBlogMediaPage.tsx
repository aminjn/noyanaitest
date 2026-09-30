"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IBlogMedia } from "./AdminManageBlogMediasPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import WithTitle from "../Admin/UI/WithTitle";
import CreateForm from "../Admin/UI/CreateForm";
import usePopup from "../Hooks/usePopup";
import DeleteBlogMediaPopup from "./DeleteBlogMediaPopup";
import useProgress from "../Hooks/useProgress";
import { adminPath } from "../helpers/adminPath";
import useAccessLevel from "../Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

// One media file: its name and the file itself. A single form, so no tabs;
// the delete sits in the header (2026-09 admin audit).
const AdminManageBlogMediaPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlogMedia>(
    params ? `${API}/auto/blogmedia/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={
            hasAccess("BlogMedia", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteBlogMedia",
                        <DeleteBlogMediaPopup
                          node={data}
                          mutate={() => push(adminPath("/blog?tab=media"))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <CreateForm
            readOnly={!hasAccess("BlogMedia", "update")}
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/blogmedia/${data._id}`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              name: { type: "text", title: ta("نام") },
              file: { title: ta("فایل"), type: "image" },
            }}
            styleManaged
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogMediaPage;
