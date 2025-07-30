"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageInlineAdPage.module.css";
import useSWR from "swr";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import Box from "../UI/Box";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteInlineAdPopup from "./DeleteInlineAdPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import List from "../UI/List";

const AdminManageInlineAdPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IInlineAdvertisement>(
    params ? `${API}/auto/inlinead/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Box>
          <TabSystem
            name="AdminManageInlineAd"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                content: (
                  <CreateForm
                    readOnly={!hasAccess("InlineAdvertisement", "update")}
                    renderer={{
                      name: { title: "نام", type: "text" },
                      title: { title: "عنوان", type: "text" },
                      subTitle: { title: "توضیحات", type: "text" },
                      image: { title: "تصویر", type: "image" },
                      target: { title: "مقصد", type: "text" },
                      active: { type: "bool", title: "فعال" },
                      expiration: { type: "date", title: "تاریخ انقضا" },
                    }}
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/inlinead/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    styleManaged
                  />
                ),
                icon: <InfoIcon />,
              },
              {
                title: "عملیات",
                icon: <InfoIcon />,
                content: (
                  <List>
                    {hasAccess("InlineAdvertisement", "delete") && (
                      <Button
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteInlineAd",
                            <DeleteInlineAdPopup
                              node={data}
                              mutate={() => push(adminPath("/inlinead"))}
                            />
                          )
                        }
                      >
                        حذف
                      </Button>
                    )}
                  </List>
                ),
                id: "Actions",
              },
            ]}
          />
        </Box>
      )}
    </HandleLoading>
  );
};

export default AdminManageInlineAdPage;
