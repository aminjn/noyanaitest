"use client";

import useSWR from "swr";
import classes from "./AdminManageSpecialitiesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import { MongoDoc } from "@/Components/Hooks/useUser";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import NewSpecialityPopup from "./NewSpecialityPopup";
import WithTitle from "../UI/WithTitle";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteSpecialityPopup from "./DeletSpecialityPopup";
import InlineLink from "../UI/InlineLink";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import OrderEditor from "../UI/OrderEditor";

export type SpecialityPopulation = Population<{
  // kept only so existing type arguments still compile; specialities have
  // no category any more (2026-09: no "speciality group" layer)
  Category: Record<never, never>;
  Doctors: DoctorProfilePopulation;
}>;
export interface ISpeciality<
  T extends SpecialityPopulation = SpecialityPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  image?: string;
  isHome: boolean;
  order: number;
  summary?: string;
  active: boolean;
  doctorsCountWithMainSpeciality?: number;
  doctorsCountWithSideSpeciality?: number;
  doctors: T["Doctors"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctors"]>[]
    : never;
  description?: string;
}

const AdminManageSpecialitiesPage = () => {
  const { data, error, mutate } = useSWR<ISpeciality[]>(
    `${API}/auto/speciality`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تخصص ها"
          actions={
            hasAccess("Sepciality", "write")
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup("NewSpeciality", <NewSpecialityPopup />),
                  },
                ]
              : []
          }
        >
          <Table
            name="AdminManageSpecialities"
            renderer={{
              name: {
                value: (node) => node.name,
                name: "نام",
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/speciality/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
              },
              active: {
                name: "وضعیت",
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              order: {
                name: "رتبه",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="speciality"
                    mutate={mutate}
                    _id={node._id}
                  />
                ),
                value: (node) => node.order,
                filter: "Number",
              },
              isHome: {
                name: "نمایش در خانه",
                value: (node) => booleanToValue[`${node.isHome}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.isHome} />,
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("Sepciality", "readOne") && (
                      <IconLink
                        href={adminPath(`/speciality/${node._id}`)}
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Sepciality", "delete") && (
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "DeleteSpeciality",
                            <DeleteSpecialityPopup
                              node={node}
                              mutate={mutate}
                            />,
                          )
                        }
                        variant="Danger"
                        title="حذف"
                      >
                        <GarbageIcon />
                      </IconButton>
                    )}
                  </TableActions>
                ),
              },
            }}
            data={data}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSpecialitiesPage;
