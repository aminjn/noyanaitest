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
              doctor: {
                name: "پزشک",
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
              status: {
                name: "وضعیت",
                value: (node) => doctorJoinClinicStatusesDict[node.status],
                filter: "Set",
              },
              submissionParty: {
                name: "ارسال‌کننده",
                value: (node) =>
                  joinClinicSubmissionPartyDict[node.submissionParty],
                filter: "Set",
              },
              submittedAt: {
                name: "زمان ثبت",
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
              },
              statusLastChangedAt: {
                name: "آخرین تغییر وضعیت",
                value: (node) =>
                  node.statusLastChangedAt
                    ? new Date(node.statusLastChangedAt)
                    : undefined,
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title="ویرایش وضعیت"
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
                      title="حذف"
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
