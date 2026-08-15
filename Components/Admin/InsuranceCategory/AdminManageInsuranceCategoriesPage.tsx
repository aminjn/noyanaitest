"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";

export type InsuranceCategoryPopulation = Population<Record<never, never>>;

export interface IInsuranceCategory<
  T extends InsuranceCategoryPopulation = InsuranceCategoryPopulation,
> extends MongoDoc {
  isActive: boolean;
  order: number;
  name?: string;
  slug?: string;
}

export const insuranceCategoryFormRenderer: FormRenderer<IInsuranceCategory> = {
  name: { title: "نام", type: "text" },
  isActive: { title: "فعال", type: "bool" },
  order: { title: "رتبه", type: "number" },
  slug: { title: "اسلاگ", type: "text" },
};

const AdminManageInsuranceCategoriesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IInsuranceCategory>
      create={insuranceCategoryFormRenderer}
      modelName="insuranceCategory"
      title="دسته بندی بیمه ها"
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
              <IconLink href={adminPath(`/insuranceCategory/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="insuranceCategory"
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

export default AdminManageInsuranceCategoriesPage;
