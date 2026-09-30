"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageAccessLevelPage.module.css";
import useSWR from "swr";
import {
  IAccessLevel,
} from "./AdminManageAccessLevelsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import WithTitle from "../UI/WithTitle";
import AccessLevelAdminsTab from "./AccessLevelAdminsTab";
import AccessLevelMatrix from "./AccessLevelMatrix";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteAccessLevelPopup from "./DeleteAccessLevelPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageAccessLevelPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IAccessLevel<{ AdminsPopulated: { UserPopulated: true } }>
  >(params ? `${API}/auto/accesslevel/${params.nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("سطح دسترسی ${1}", [data.name || ta("بدون نام")])}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleteAccessLevel",
                  <DeleteAccessLevelPopup
                    node={data as unknown as IAccessLevel}
                    mutate={() => push(adminPath(`/accesslevel`))}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageAccessLevel"
            items={[
              {
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/accesslevel/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{ name: { type: "text", title: ta("نام") } }}
                  />
                ),
                id: "Info",
              },
              {
                title: ta("دسترسی‌ها"),
                id: "Matrix",
                content: (
                  <AccessLevelMatrix
                    node={data as unknown as IAccessLevel}
                    mutate={mutate}
                  />
                ),
              },
              {
                title: ta("کارکنان این نقش"),
                id: "AdminsInThis",
                content: <AccessLevelAdminsTab mutate={mutate} node={data} />,
                icon: <InfoIcon />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageAccessLevelPage;
