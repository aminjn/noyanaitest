"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { FormRenderer } from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import usePopup from "@/Components/Hooks/usePopup";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type AboutTeamPopulation = Population<Record<never, never>>;

export interface IAboutTeam<
  T extends AboutTeamPopulation = AboutTeamPopulation,
> extends MongoDoc {
  avatar?: string;
  name?: string;
  title?: string;
  description?: string;
  linkedin?: string;
  isActive: boolean;
  order: number;
}

export const aboutTeamFormRenderer: FormRenderer<IAboutTeam> = {
  name: { type: "text", get title() {
  return ta("نام");
} },
  avatar: { type: "image", get title() {
  return ta("تصویر");
} },
  description: { type: "text", get title() {
  return ta("توضیحات");
} },
  isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
  title: { get title() {
  return ta("عنوان");
}, type: "text" },
  linkedin: { type: "text", get title() {
  return ta("لینکدین");
} },
};

const AdminManageAboutTeamsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IAboutTeam>
      create={aboutTeamFormRenderer}
      title={ta("تیم")}
      modelName="aboutTeam"
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        title: { name: ta("عنوان"), value: (node) => node.title, filter: "Text" },
        isActive: {
          name: ta("وضعیت"),
          value: (node) => booleanToValue[`${node.isActive}`],
          filter: "Set",
          component: (node) => <BooleanToIcon value={node.isActive} />,
        },
        order: {
          name: ta("رتبه"),
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="aboutTeam"
              _id={node._id}
              value={node.order}
              mutate={mutate}
            />
          ),
        },
        linkedin: {
          name: ta("لینکدین"),
          value: (node) => node.linkedin,
          filter: "Text",
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/aboutTeam/${node._id}`)}
                title={ta("ویرایش")}
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="aboutTeam"
                      mutate={mutate}
                      nodeId={node._id}
                    />,
                  )
                }
              >
                <GarbageIcon />
              </IconButton>
            </TableActions>
          ),
        },
      })}
    />
  );
};

export default AdminManageAboutTeamsPage;
