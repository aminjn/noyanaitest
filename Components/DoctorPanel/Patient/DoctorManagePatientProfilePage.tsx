"use client";

import classes from "./DoctorManagePatientProfilePage.module.css";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IPatientProfile } from "./PatientFiles";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import UserIdentity from "@/Components/Dashboard/UserIdentity";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import usePopup from "@/Components/Hooks/usePopup";
import PreviewPatientProfileRecordPopup from "./PreviewPatientProfileRecordPopup";
import NewPatientProfileRecordPopup from "./NewPatientProfileRecordPopup";

const DoctorManagePatientProfilePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IPatientProfile<{
      Records: { Author: Record<never, never>; File: Record<never, never> };
      Doctor: Record<never, never>;
      User: { Identity: Record<never, never> };
    }>
  >(nodeId ? `${API}/doctor/patient/record/${nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patients"), target: "/doctorpanel/patient" },
  ]);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.header}>
            <UserIdentity
              identity={data.user.identity}
              avatar={data.user.avatar}
              username={data.user.username}
            />
          </div>
          <WithTitle
            title={getContent("patientProfileRecords")}
            actions={[
              {
                title: getContent("newPatientProfileRecord"),
                action: () =>
                  setPopup(
                    "NewPatientProfileRecord",
                    <NewPatientProfileRecordPopup
                      profile={data}
                      mutate={mutate}
                    />
                  ),
              },
            ]}
          >
            <Table
              data={data.records || []}
              name="DoctorManagePatientProfileRecords"
              renderer={{
                createdAt: {
                  name: getContent("createdAt"),
                  value: (node) => new Date(node.createdAt),
                  component: (node) => <FormatDate value={node.createdAt} />,
                  filter: "Date",
                },
                author: {
                  name: getContent("doctor"),
                  value: (node) => getDoctorProfileLabel(node.author),
                  filter: "Multi",
                },
                title: {
                  name: getContent("title"),
                  value: (node) => node.title,
                  filter: "Text",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "PreviewPatientProfileRecord",
                            <PreviewPatientProfileRecordPopup node={node} />
                          )
                        }
                      >
                        <EyeIcon />
                      </IconButton>
                    </TableActions>
                  ),
                },
              }}
            />
          </WithTitle>
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManagePatientProfilePage;
