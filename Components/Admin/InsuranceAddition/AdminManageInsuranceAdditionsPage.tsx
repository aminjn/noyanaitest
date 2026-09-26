"use client";

import useSWR from "swr";
import classes from "./AdminManageInsuranceAdditionsPage.module.css";
import { IInsuranceAdditionRequest } from "@/Components/DoctorPanel/Insurance/DoctorInsuranceAdditionRequestsTab";
import { additionRequestStatusDict } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import CreateInsuranceFromRequestPopup from "./CreateInsuranceFromRequestPopup";
import MutateInsuranceRequestPopup from "./MutateInsuranceRequestPopup";
import DeleteInsuranceAdditionRequestPopup from "./DeleteInsuranceAdditionRequestPopup";

const AdminManageInsuranceAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IInsuranceAdditionRequest<{ Doctor: Record<never, never> }>[]
  >(`${API}/auto/insuranceaddition`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های اضافه شدن بیمه">
          <Table
            name="AdminManageInsuranceAdditionRequests"
            data={data}
            renderer={{
              name: {
                name: "نام بیمه",
                value: (node) => node.name,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              submittedBy: {
                name: "ثبت کننده",
                value: (node) =>
                  node.submittedBy
                    ? getDoctorProfileLabel(node.submittedBy)
                    : "حذف شده",
                filter: "Text",
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
                name: "زمان ثبت",
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              description: {
                name: "توضیحات",
                value: (node) => node.description,
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                width: 150,
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
                      title="ایجاد بیمه از درخواست"
                      onClick={() =>
                        setPopup(
                          "CreateInsuranceFromRequest",
                          <CreateInsuranceFromRequestPopup node={node} />,
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
                          "MutateInsuranceRequest",
                          <MutateInsuranceRequestPopup
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
                          "DeleteInsuranceAdditionRequest",
                          <DeleteInsuranceAdditionRequestPopup
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

export default AdminManageInsuranceAdditionsPage;
