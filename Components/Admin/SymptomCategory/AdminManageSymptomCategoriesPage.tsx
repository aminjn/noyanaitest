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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  name: { type: "text", get title() {
  return ta("نام");
} },
  slug: { type: "text", get title() {
  return ta("اسلاگ");
} },
  isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
};

const AdminManageSymptomCategoriesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<ISymptomCategory>
      modelName="symptomCategory"
      create={symptomCategoryFormRenderer}
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        isActive: {
          name: ta("وضعیت"),
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: ta("رتبه"),
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
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/symptomCategory/${node._id}`)}
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
      title={ta("دسته بندی علائم")}
    />
  );
};

export default AdminManageSymptomCategoriesPage;
