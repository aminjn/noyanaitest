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

const AdminManageDoctorFaqsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorFaq<{ Doctor: Record<never, never> }>[]
  >(`${API}/auto/doctorfaq`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="سوالات متداول"
          actions={[
            {
              title: "جدید",
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
                name: "سوال",
                value: (node) => node.question,
                filter: "Text",
              },
              answer: {
                name: "جواب",
                value: (node) => node.answer,
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              active: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              doctor: {
                name: "دکتر",
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : "ندارد",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink href={adminPath(`/doctorprofile/${node._id}`)}>
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    "ندارد"
                  ),
                filter: "Multi",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/doctorfaq/${node._id}`)}>
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorFaq",
                          <DeleteDoctorFaqPopup mutate={mutate} node={node} />
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
