"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorSecretaryAccessLevelPage.module.css";
import {
  categorizedDoctorSecretaryActions,
  doctorSecretaryActionCategories,
  doctorSecretaryActionCategoriesDict,
  doctorSecretaryActionDict,
  doctorSecretaryActions,
  IDoctorSecretaryAccessLevel,
} from "./AdminManageDoctorSecretaryAccessLevelsPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import { getDoctorSecretaryAccessLavelLabel } from "../Lib/LabelGetters";
import TabSystem, { TabSystemTab } from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorSecretaryAccessLevelPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IDoctorSecretaryAccessLevel>(
    params ? `${API}/auto/doctorsecretaryaccesslevel/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getDoctorSecretaryAccessLavelLabel(data)}>
          <TabSystem
            name="AdminManageDoctorSecretaryAccessLevel"
            items={[
              {
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/doctorsecretaryaccesslevel/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    renderer={{ name: { type: "text", title: ta("نام") } }}
                  />
                ),
                id: "Info",
              },
              ...doctorSecretaryActionCategories.reduce(
                (acc, category) => [
                  ...acc,
                  {
                    title: doctorSecretaryActionCategoriesDict[category],
                    icon: <InfoIcon />,
                    id: category,
                    content: (
                      <CreateForm
                        defaultValue={data}
                        renderer={{
                          ...categorizedDoctorSecretaryActions[category].reduce(
                            (ac, action) => ({
                              ...ac,
                              [action]: {
                                type: "bool",
                                title: doctorSecretaryActionDict[action],
                              },
                            }),
                            {}
                          ),
                        }}
                        hookProps={{
                          path: `${API}/auto/doctorsecretaryaccesslevel/${data._id}`,
                          method: "POST",
                          successCb: () => {
                            mutate();
                          },
                        }}
                      />
                    ),
                  },
                ],
                [] as TabSystemTab[]
              ),
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorSecretaryAccessLevelPage;
