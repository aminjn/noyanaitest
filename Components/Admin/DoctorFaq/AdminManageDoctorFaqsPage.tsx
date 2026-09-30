"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import usePopup from "@/Components/Hooks/usePopup";
import CreateFaqPopup from "./CreateDoctorFaqPopup";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import DeleteDoctorFaqPopup from "./DeleteDoctorFaqPopup";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorFaqsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorFaq<{ Doctor: Record<never, never> }>[]
  >(`${API}/auto/doctorfaq`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("سوالات متداول")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup("CreateFaq", <CreateFaqPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDoctorFaqs"
            renderer={{
              question: {
                name: ta("سوال"),
                value: (node) => node.question,
                filter: "Text",
              },
              doctor: {
                name: ta("پزشک"),
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : ta("ندارد"),
                component: (node) =>
                  node.doctor ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.doctor._id}`)}
                    >
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    ta("ندارد")
                  ),
                filter: "Multi",
              },
              active: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    modelName="doctorfaq"
                    mutate={mutate}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/doctorfaq/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorFaq",
                          <DeleteDoctorFaqPopup mutate={mutate} node={node} />,
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

export default AdminManageDoctorFaqsPage;
