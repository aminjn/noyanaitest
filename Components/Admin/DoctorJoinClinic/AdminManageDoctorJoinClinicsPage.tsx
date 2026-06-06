"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorJoinClinicsPage.module.css";
import {
  doctorJoinClinicStatusesDict,
  IDoctorJoinClinicRequest,
  joinClinicSubmissionPartyDict,
} from "@/Components/DoctorPanel/Clinic/DoctorJoinClinicsTab";
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
import EditDoctorJoinClinicStatusPopup from "./EditDoctorJoinClinicStatusPopup";
import DeleteDoctorJoinClinicPopup from "./DeleteDoctorJoinClinicPopup";

const AdminManageDoctorJoinClinicsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinClinicRequest<{
      Clinic: Record<never, never>;
      Doctor: Record<never, never>;
    }>[]
  >(`${API}/auto/doctorjoinclinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های عضویت پزشکان در کلینیک ها">
          <Table
            data={data}
            renderer={{
              clinic: {
                name: "کلینیک",
                value: (node) => node.clinic?.name,
                filter: "Multi",
                component: (node) =>
                  node.clinic ? (
                    <InlineLink href={adminPath(`/clinic/${node.clinic._id}`)}>
                      {node.clinic.name || node.clinic._id}
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
                value: (node) => doctorJoinClinicStatusesDict[node.status],
                filter: "Set",
              },
              submissionParty: {
                name: "طرف ارسال کننده",
                value: (node) =>
                  joinClinicSubmissionPartyDict[node.submissionParty],
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
                          "EditDoctorJoinClinic",
                          <EditDoctorJoinClinicStatusPopup
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
                          "DeleteDoctorJoinClinic",
                          <DeleteDoctorJoinClinicPopup
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
            name="AdminManageDoctorJoinClinics"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorJoinClinicsPage;
