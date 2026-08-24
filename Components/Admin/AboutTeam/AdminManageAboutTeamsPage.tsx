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
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import OrderEditor from "../UI/OrderEditor";

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
  name: { type: "text", title: "نام" },
  avatar: { type: "image", title: "تصویر" },
  description: { type: "text", title: "توضیحات" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
  title: { title: "عنوان", type: "text" },
  linkedin: { type: "text", title: "لینکدین" },
};

const AdminManageAboutTeamsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IAboutTeam>
      create={aboutTeamFormRenderer}
      title="تیم"
      modelName="aboutTeam"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        title: { name: "عنوان", value: (node) => node.title, filter: "Text" },
        description: {
          name: "توضیحات",
          value: (node) => node.description,
          filter: "Text",
        },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          filter: "Set",
          component: (node) => <BooleanToIcon value={node.isActive} />,
        },
        order: {
          name: "رتبه",
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
          name: "لینکدین",
          value: (node) => node.linkedin,
          filter: "Text",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/aboutTeam/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
