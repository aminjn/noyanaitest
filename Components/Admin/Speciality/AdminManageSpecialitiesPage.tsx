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
import useProgress from "@/Components/Hooks/useProgress";
import { ta } from "@/Components/Admin/i18n/adminText";
import PublishToggle from "../UI/PublishToggle";

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
  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تخصص ها")}
          actions={
            hasAccess("Sepciality", "write")
              ? [
                  {
                    title: ta("جدید"),
                    // the full form, saved once (AdminRecordEditor)
                    action: () => push(adminPath("/speciality/new")),
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
                name: ta("نام"),
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/speciality/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
              },
              active: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => (
                  // one click switches it on or off
                  <PublishToggle
                    modelName="speciality"
                    field="active"
                    _id={node._id}
                    value={!!node.active}
                    mutate={mutate}
                  />
                ),
              },
              order: {
                name: ta("رتبه"),
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
                name: ta("نمایش در خانه"),
                value: (node) => booleanToValue[`${node.isHome}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.isHome} />,
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("Sepciality", "readOne") && (
                      <IconLink
                        href={adminPath(`/speciality/${node._id}`)}
                        title={ta("ویرایش")}
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
                        title={ta("حذف")}
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
