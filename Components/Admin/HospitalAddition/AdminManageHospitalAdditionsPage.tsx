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
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
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
import CreateFromAdditionPopup from "../UI/CreateFromAdditionPopup";
import MutateHospitalRequestPopup from "./MutateHospitalRequestPopup";
import DeleteHospitalAdditionRequestPopup from "./DeleteHospitalAdditionRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

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
        <WithTitle title={ta("درخواست های اضافه شدن بیمارستان")}>
          <Table
            name="AdminManageHospitalAdditionRequests"
            data={data}
            renderer={{
              hospitalName: {
                name: ta("نام بیمارستان"),
                value: (node) => node.hospitalName,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: ta("استان / شهر"),
                value: (node) =>
                  [findProvince(node.province), findCity(node.city)]
                    .filter(Boolean)
                    .join(ta("، ")),
                filter: "Multi",
              },
              owner: {
                name: ta("مالک"),
                value: (node) =>
                  [node.ownerName, node.ownerPhone].filter(Boolean).join(" - "),
                filter: "Text",
              },
              submittedBy: {
                name: ta("ثبت کننده"),
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
                filter: "Text",
              },
              submittedAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                width: 150,
                component: (node) => (
                  <TableActions>
                    {node.status !== "Done" && node.status !== "Rejected" && (
                      <IconButton
                        variant="Success"
                        title={ta("ایجاد بیمارستان از این درخواست")}
                        onClick={() =>
                          setPopup(
                            "CreateHospitalFromRequest",
                            <CreateFromAdditionPopup
                              kind="hospital"
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
                      title={ta("حذف")}
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
