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
import FormatDate from "@/Components/UI/FormatDate";
import { getDoctorLabel, getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { findCity } from "@/Components/Enums/Cities";
import { findProvince } from "@/Components/Enums/Provinces";
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
              submittedAt: {
                name: "زمان ثبت",
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              submittedBy: {
                name: "ثبت کننده",
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
                    ""
                  ),
              },
              clinicName: {
                name: "نام کلینیک",
                value: (node) => node.clinicName,
                filter: "Text",
              },
              clinicAddress: {
                name: "آدرس کلینیک",
                value: (node) => node.clinicAddress,
                filter: "Text",
              },
              ownerName: {
                name: "صاحب کلینیک",
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: "شماره صاحب کلینیک",
                value: (node) => node.ownerPhone,
                filter: "Text",
              },
              province: {
                name: "استان",
                value: (node) => findProvince(node.province),
                filter: "Multi",
              },
              city: {
                name: "شهر",
                value: (node) => findCity(node.city),
                filter: "Multi",
              },
              description: {
                name: "توضیحات",
                value: (node) => node.description,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
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
