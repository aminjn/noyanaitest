"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageAccessLevelPage.module.css";
import useSWR from "swr";
import {
  accessLevelModelDict,
  accessLevelModels,
  accessLevelOperationsDict,
  accessOperations,
  IAccessLevel,
} from "./AdminManageAccessLevelsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import WithTitle from "../UI/WithTitle";
import { title } from "process";
import AccessLevelAdminsTab from "./AccessLevelAdminsTab";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteAccessLevelPopup from "./DeleteAccessLevelPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const AdminManageAccessLevelPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IAccessLevel<{ AdminsPopulated: { UserPopulated: true } }>
  >(params ? `${API}/auto/accesslevel/${params.nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={`سطح دسترسی ${data.name || data._id}`}>
          <TabSystem
            name="AdminManageAccessLevel"
            items={[
              {
                title: "اطلاعات",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/accesslevel/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                    }}
                    renderer={{ name: { type: "text", title: "نام" } }}
                  />
                ),
                id: "Info",
              },
              ...accessLevelModels.map((model) => ({
                title: accessLevelModelDict[model],
                icon: <InfoIcon />,
                id: model,
                content: (
                  <CreateForm
                    defaultValue={data[model]}
                    hookProps={{
                      path: `${API}/auto/accesslevel/${data._id}`,
                      method: "POST",
                      successCb: () => mutate(),
                      mutator: (inp) => ({
                        $set: Object.entries(inp).reduce(
                          (acc, [key, value]) => ({
                            ...acc,
                            [`${model}.${key}`]: value,
                          }),
                          {}
                        ),
                      }),
                    }}
                    renderer={accessOperations.reduce(
                      (acc, op) => ({
                        ...acc,
                        [op]: {
                          type: "bool",
                          title: accessLevelOperationsDict[op],
                        },
                      }),
                      {}
                    )}
                  />
                ),
              })),
              {
                title: "ادمین های این سطح دسترسی",
                id: "AdminsInThis",
                content: <AccessLevelAdminsTab mutate={mutate} node={data} />,
                icon: <InfoIcon />,
              },
              {
                title: "عملیات",
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <Button
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteAccessLevel",
                          <DeleteAccessLevelPopup
                            node={data as unknown as IAccessLevel}
                            mutate={() => push(adminPath(`/accesslevel`))}
                          />
                        )
                      }
                    >
                      حذف کامل این سطح دسترسی
                    </Button>
                  </List>
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageAccessLevelPage;
