"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { FormRenderer } from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

export type ParaClinicTagPopulation = Population<Record<never, never>>;
export interface IParaClinicTag<
  T extends ParaClinicTagPopulation = ParaClinicTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

export const paraClinicTagFormRenderer: FormRenderer<IParaClinicTag> = {
  name: { type: "text", title: "نام" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
};

const AdminManageParaClinicTagsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IParaClinicTag>
      create={paraClinicTagFormRenderer}
      title="تگ پاراکلینیک"
      modelName="paraClinicTag"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: { name: "رتبه", value: (node) => node.order, filter: "Number" },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/paraClinicTag/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      nodeId={node._id}
                      modelName="paraClinicTag"
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
      })}
    />
  );
};

export default AdminManageParaClinicTagsPage;
