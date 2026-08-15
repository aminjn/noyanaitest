"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";

export type InsuranceTagPopulation = Population<Record<never, never>>;

export interface IInsuranceTag<
  T extends InsuranceTagPopulation = InsuranceTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

export const insuranceTagFormRenderer: FormRenderer<IInsuranceTag> = {
  name: { type: "text", title: "نام" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
};

const AdminManageInsuranceTagsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IInsuranceTag>
      modelName="insuranceTag"
      title="تگ بیمه"
      create={insuranceTagFormRenderer}
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: { name: "رتیه", value: (node) => node.order, filter: "Number" },
        action: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/insuranceTag/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      nodeId={node._id}
                      modelName="insuranceTag"
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

export default AdminManageInsuranceTagsPage;
