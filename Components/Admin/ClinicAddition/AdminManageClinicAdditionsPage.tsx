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
import CreateFromAdditionPopup from "../UI/CreateFromAdditionPopup";
import MutateClinicRequestPopup from "./MutateClinicRequestPopup";
import DeleteClinicAdditionRequestPopup from "./DeleteClinicAdditionRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

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
        <WithTitle title={ta("درخواست های اضافه شدن کلینیک")}>
          <Table
            name="AdminManageClinicAdditionRequests"
            data={data}
            renderer={{
              clinicName: {
                name: ta("نام کلینیک"),
                value: (node) => node.clinicName,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: ta("شهر"),
                value: (node) => findCity(node.city),
                filter: "Multi",
              },
              ownerName: {
                name: ta("مالک"),
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: ta("تلفن مالک"),
                value: (node) => node.ownerPhone,
                filter: "Text",
              },
              submittedBy: {
                name: ta("ثبت‌کننده"),
                value: (node) =>
                  node.submittedBy
                    ? getDoctorProfileLabel(node.submittedBy)
                    : ta("حذف شده"),
                component: (node) =>
                  node.submittedBy ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.submittedBy._id}`)}
                    >
                      {getDoctorProfileLabel(node.submittedBy)}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              submittedAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {node.status !== "Done" && node.status !== "Rejected" && (
                      <IconButton
                        variant="Success"
                        title={ta("ایجاد کلینیک")}
                        onClick={() =>
                          setPopup(
                            "CreateClinicFromRequest",
                            <CreateFromAdditionPopup
                              kind="clinic"
                              requestId={node._id}
                              mutate={mutate}
                            />,
                          )
                        }
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      variant="Info"
                      title={ta("ویرایش")}
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
                      title={ta("حذف")}
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
