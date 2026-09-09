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
              hospitalName: {
                name: "نام بیمارستان",
                value: (node) => node.hospitalName,
                filter: "Text",
              },
              hospitalAddress: {
                name: "آدرس بیمارستان",
                value: (node) => node.hospitalAddress,
                filter: "Text",
              },
              ownerName: {
                name: "صاحب بیمارستان",
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: "شماره صاحب بیمارستان",
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
                          "CreateHospitalFromRequest",
                          <CreateHospitalFromRequestPopup node={node} />,
                        )
                      }
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      variant="Info"
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
