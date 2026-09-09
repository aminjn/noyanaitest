"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorJoinHospitalsPage.module.css";
import {
  doctorJoinHospitalStatusesDict,
  IDoctorJoinHospitalRequest,
  joinHospitalSubmissionPartyDict,
} from "@/Components/DoctorPanel/Hospital/DoctorJoinHospitalsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { getDoctorLabel, getDoctorProfileLabel } from "../Lib/LabelGetters";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import EditDoctorJoinHospitalStatusPopup from "./EditDoctorJoinHospitalStatusPopup";
import DeleteDoctorJoinHospitalPopup from "./DeleteDoctorJoinHospitalPopup";

const AdminManageDoctorJoinHospitalsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinHospitalRequest<{
      Hospital: Record<never, never>;
      Doctor: Record<never, never>;
    }>[]
  >(`${API}/auto/doctorjoinhospital`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های عضویت پزشکان در بیمارستان ها">
          <Table
            data={data}
            renderer={{
              hospital: {
                name: "بیمارستان",
                value: (node) => node.hospital?.name,
                filter: "Multi",
                component: (node) =>
                  node.hospital ? (
                    <InlineLink href={adminPath(`/hospital/${node.hospital._id}`)}>
                      {node.hospital.name || node.hospital._id}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
              },
              doctor: {
                name: "دکتر",
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : "",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.doctor._id}`)}
                    >
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
                filter: "Multi",
              },
              submittedAt: {
                name: "زمان ثبت",
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              status: {
                name: "وضعیت",
                value: (node) => doctorJoinHospitalStatusesDict[node.status],
                filter: "Set",
              },
              submissionParty: {
                name: "طرف ارسال کننده",
                value: (node) =>
                  joinHospitalSubmissionPartyDict[node.submissionParty],
                filter: "Set",
              },
              statusLastChangedAt: {
                name: "آخرین تغییر وضعیت",
                value: (node) => new Date(node.statusLastChangedAt),
                component: (node) => (
                  <FormatDate value={node.statusLastChangedAt} />
                ),
                filter: "Date",
              },
              message: {
                name: "پیام",
                value: (node) => node.message,
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "EditDoctorJoinHospital",
                          <EditDoctorJoinHospitalStatusPopup
                            node={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorJoinHospital",
                          <DeleteDoctorJoinHospitalPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
            name="AdminManageDoctorJoinHospitals"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorJoinHospitalsPage;
