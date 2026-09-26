"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { FormRenderer } from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import OrderEditor from "../UI/OrderEditor";

export type SymptomCategoryPopulation = Population<Record<never, never>>;
export interface ISymptomCategory<
  T extends SymptomCategoryPopulation = SymptomCategoryPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

export const symptomCategoryFormRenderer: FormRenderer<ISymptomCategory> = {
  name: { type: "text", title: "نام" },
  slug: { type: "text", title: "اسلاگ" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
};

const AdminManageSymptomCategoriesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<ISymptomCategory>
      modelName="symptomCategory"
      create={symptomCategoryFormRenderer}
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "وضعیت",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: "رتبه",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              _id={node._id}
              value={node.order}
              mutate={mutate}
              modelName="symptomCategory"
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/symptomCategory/${node._id}`)}
                title="ویرایش"
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="symptomCategory"
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
      title="دسته بندی علائم"
    />
  );
};

export default AdminManageSymptomCategoriesPage;
