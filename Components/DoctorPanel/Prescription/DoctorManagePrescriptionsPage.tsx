"use client";
import Button from "@/Components/UI/Button";
import classes from "./DoctorManagePrescriptionsPage.module.css";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import DoctorTaminTokenManager from "./DoctorTaminTokenManager";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import useProgress from "@/Components/Hooks/useProgress";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import { IPrescription } from "./Create/PrescriptionItemsOverview";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import FileIcon from "@/Components/Icons/FileIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import LoadPrescriptionsFromTamin from "./LoadPrescriptionsFromTamin";
import usePopup from "@/Components/Hooks/usePopup";

const DoctorManagePrescriptionsPage = () => {
  const getContent = useLocale();

  const { data, error } = useSWR<
    IPrescription<{
      Patient: Record<never, never>;
      TaminStatus: Record<never, never>;
    }>[]
  >(`${API}/doctor/presc`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const push = useProgress();

  const { setPopup } = usePopup();

  return (
    <div>
      <DoctorTaminTokenManager />
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle
            title={getContent("prescriptionsList")}
            collapsed={
              <Fragment>
                <Button onClick={() => push("/doctorpanel/prescription")}>
                  {getContent("newPrescription")}
                </Button>
                <Button
                  onClick={() =>
                    setPopup(
                      "loadPrescriptionsFromTamin",
                      <LoadPrescriptionsFromTamin />,
                    )
                  }
                >
                  {getContent("loadPrescriptionsFromTamin")}
                </Button>
              </Fragment>
            }
          >
            <Table
              data={data}
              name="DoctorManagePrescriptions"
              renderer={{
                createdAt: {
                  name: getContent("createdAt"),
                  value: (node) => new Date(node.createdAt),
                  component: (node) => <FormatDate value={node.createdAt} />,
                  filter: "Date",
                },
                patient: {
                  name: getContent("patientName"),
                  value: (node) =>
                    `${node.patient.givenName} ${node.patient.lastName}`,
                  filter: "Text",
                },
                patientNationalCode: {
                  name: getContent("patientNationalCode"),
                  value: (node) => node.patient.nationalId,
                  filter: "Text",
                },
                taminTracking: {
                  name: getContent("taminPrescriptionTracking"),
                  value: (node) => node.taminStatus?.tracking || "",
                  filter: "Text",
                },
                taminId: {
                  name: getContent("taminPrescriptionId"),
                  value: (node) => node.taminStatus?.taminId || "",
                  filter: "Text",
                },
                labTaminTracking: {
                  name: getContent("labTaminTracking"),
                  value: (node) => node.taminStatus?.labTracking,
                  filter: "Text",
                },
                labTaminId: {
                  name: getContent("labTaminId"),
                  value: (node) => node.taminStatus?.labTaminId,
                  filter: "Text",
                },
                taminDate: {
                  name: getContent("submitToTaminDate"),
                  value: (node) =>
                    node.taminStatus
                      ? new Date(node.taminStatus.submittedAt)
                      : "",
                  component: (node) =>
                    node.taminStatus ? (
                      <FormatDate value={node.taminStatus.submittedAt} />
                    ) : (
                      ""
                    ),
                  filter: "Date",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        href={`/doctorpanel/prescription/${node._id}`}
                        title={getContent("prescriptionDetails")}
                      >
                        <FileIcon />
                      </IconLink>
                    </TableActions>
                  ),
                },
              }}
            />
          </WithTitle>
        )}
      </HandleLoading>
    </div>
  );
};

export default DoctorManagePrescriptionsPage;
