"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

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
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteInlineAdPopup from "./DeleteInlineAdPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageInlineAdPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IInlineAdvertisement>(
    params ? `${API}/auto/inlinead/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || data.title || ta("بدون نام")}
          actions={
            hasAccess("InlineAdvertisement", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteInlineAd",
                        <DeleteInlineAdPopup
                          node={data}
                          mutate={() => push(adminPath("/ads?tab=inline"))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <TabSystem
            name="AdminManageInlineAd"
            items={[
              {
                title: ta("جزئیات"),
                id: "Info",
                content: (
                  <CreateForm
                    readOnly={!hasAccess("InlineAdvertisement", "update")}
                    renderer={{
                      name: { title: ta("نام"), type: "text" },
                      title: { title: ta("عنوان"), type: "text" },
                      subTitle: { title: ta("توضیحات"), type: "text" },
                      image: { title: ta("تصویر"), type: "image" },
                      target: { title: ta("مقصد"), type: "text" },
                      active: { type: "bool", title: ta("فعال") },
                      expiration: { type: "date", title: ta("تاریخ انقضا") },
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
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="inlinead" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageInlineAdPage;
