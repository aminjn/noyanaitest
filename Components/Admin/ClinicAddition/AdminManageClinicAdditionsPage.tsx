"use client";

import useSWR from "swr";
import classes from "./AdminManageClinicAdditionsPage.module.css";
import {
  additionRequestStatusDict,
  IClinicAdditionRequest,
} from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { findCity } from "@/Components/Enums/Cities";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import CreateClinicFromRequestPopup from "./CreateClinicFromRequestPopup";
import MutateClinicRequestPopup from "./MutateClinicRequestPopup";
import DeleteClinicAdditionRequestPopup from "./DeleteClinicAdditionRequestPopup";

const AdminManageClinicAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IClinicAdditionRequest<{ user: Record<never, never> }>[]
  >(`${API}/auto/clinicaddition`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های اضافه شدن کلینیک">
          <Table
            name="AdminManageClinicAdditionRequests"
            data={data}
            renderer={{
              clinicName: {
                name: "نام کلینیک",
                value: (node) => node.clinicName,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: "شهر",
                value: (node) => findCity(node.city),
                filter: "Multi",
              },
              ownerName: {
                name: "مالک",
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: "تلفن مالک",
                value: (node) => node.ownerPhone,
                filter: "Text",
              },
              submittedBy: {
                name: "ثبت‌کننده",
                value: (node) =>
                  node.submittedBy
                    ? getDoctorProfileLabel(node.submittedBy)
                    : "حذف شده",
                component: (node) =>
                  node.submittedBy ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.submittedBy._id}`)}
                    >
                      {getDoctorProfileLabel(node.submittedBy)}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
              },
              submittedAt: {
                name: "تاریخ ثبت",
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
                      title="ایجاد کلینیک"
                      onClick={() =>
                        setPopup(
                          "CreateClinicFromRequest",
                          <CreateClinicFromRequestPopup node={node} />,
                        )
                      }
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      variant="Info"
                      title="ویرایش"
                      onClick={() =>
                        setPopup(
                          "MutateClinicRequest",
                          <MutateClinicRequestPopup
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
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteClinicAdditionRequest",
                          <DeleteClinicAdditionRequestPopup
                            node={node}
                            mutate={mutate}
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
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageClinicAdditionsPage;
