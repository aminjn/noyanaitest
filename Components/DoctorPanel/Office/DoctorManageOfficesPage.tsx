"use client";
import useSWR from "swr";
import classes from "./DoctorManageOfficePage.module.css";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import DoctorMutateOfficePopup from "./DoctorMutateOfficePopup";
import Table from "@/Components/Admin/UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteOfficePopup from "./DeleteOfficePopup";
import OrderEditor from "@/Components/Admin/UI/OrderEditor";

export type OfficePopulation = Population<{ Doctor: DoctorProfilePopulation }>;

export interface IOffice<
  T extends OfficePopulation = OfficePopulation,
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  name?: string;
  address?: string;
  tel?: string;
  order: number;
  active: boolean;
  location?: { type: "Point"; coordinates?: [number, number] };
}

const DoctorManageOfficesPage = () => {
  const { data, error, mutate } = useSWR<IOffice[]>(
    `${API}/doctor/office`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("office"), target: "/doctorpanel/office" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("offices")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "DoctorMutateOffice",
                  <DoctorMutateOfficePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageOffices"
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              address: {
                name: getContent("address"),
                value: (node) => node.address,
                filter: "Text",
              },
              tel: {
                name: getContent("telephone"),
                value: (node) => node.tel,
                filter: "Text",
              },
              order: {
                name: getContent("order"),
                value: (node) => node.order,
                filter: "Number",
              },
              active: {
                name: getContent("isActive"),
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink href={`/doctorpanel/office/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DoctorDeleetOffice",
                          <DeleteOfficePopup node={node} mutate={mutate} />,
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

export default DoctorManageOfficesPage;
