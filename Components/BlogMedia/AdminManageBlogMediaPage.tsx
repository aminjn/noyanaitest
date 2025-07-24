"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageBlogMediaPage.module.css";
import useSWR from "swr";
import { IBlogMedia } from "./AdminManageBlogMediasPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import TabSystem from "../Admin/UI/TabSystem";
import Box from "../Admin/UI/Box";
import InfoIcon from "../Icons/InfoIcon";
import CreateForm from "../Admin/UI/CreateForm";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import DeleteBlogMediaPopup from "./DeleteBlogMediaPopup";
import useProgress from "../Hooks/useProgress";
import { adminPath } from "../helpers/adminPath";

const AdminManageBlogMediaPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IBlogMedia>(
    params ? `${API}/auto/blogmedia/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Box>
          <TabSystem
            items={[
              {
                title: "جزئیات",
                icon: <InfoIcon />,
                id: "Info",
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/blogmedia/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      name: { type: "text", title: "نام" },
                      file: { title: "فایل", type: "image" },
                    }}
                    styleManaged
                  />
                ),
              },
              {
                title: "عملیات",
                icon: <InfoIcon />,
                id: "Actions",
                content: (
                  <Button
                    variant="Danger"
                    onClick={() =>
                      setPopup(
                        "DeleteBlogMedia",
                        <DeleteBlogMediaPopup
                          node={data}
                          mutate={() => push(adminPath("/blogmedia"))}
                        />
                      )
                    }
                  >
                    حذف
                  </Button>
                ),
              },
            ]}
            name="AdminManageBlogMedia"
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogMediaPage;
