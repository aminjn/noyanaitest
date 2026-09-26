"use client";

import useSWR from "swr";
import classes from "./AdminManageHospitalAdditionsPage.module.css";
import {
  additionRequestStatusDict,
  IHospitalAdditionRequest,
} from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
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
import CreateHospitalFromRequestPopup from "./CreateHospitalFromRequestPopup";
import MutateHospitalRequestPopup from "./MutateHospitalRequestPopup";
import DeleteHospitalAdditionRequestPopup from "./DeleteHospitalAdditionRequestPopup";

const AdminManageHospitalAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IHospitalAdditionRequest<{ user: Record<never, never> }>[]
  >(`${API}/auto/hospitaladdition`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های اضافه شدن بیمارستان">
          <Table
            name="AdminManageHospitalAdditionRequests"
            data={data}
            renderer={{
              hospitalName: {
                name: "نام بیمارستان",
                value: (node) => node.hospitalName,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: "استان / شهر",
                value: (node) =>
                  [findProvince(node.province), findCity(node.city)]
                    .filter(Boolean)
                    .join("، "),
                filter: "Multi",
              },
              owner: {
                name: "مالک",
                value: (node) =>
                  [node.ownerName, node.ownerPhone].filter(Boolean).join(" - "),
                filter: "Text",
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
                    "حذف شده"
                  ),
                filter: "Text",
              },
              submittedAt: {
                name: "تاریخ ثبت",
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                width: 150,
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
                      title="ایجاد بیمارستان از این درخواست"
                      onClick={() =>
                        setPopup(
                          "CreateHospitalFromRequest",
                          <CreateHospitalFromRequestPopup node={node} />,
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
                          "MutateHospitalRequest",
                          <MutateHospitalRequestPopup
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
                          "DeleteHospitalAdditionRequest",
                          <DeleteHospitalAdditionRequestPopup
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

export default AdminManageHospitalAdditionsPage;
