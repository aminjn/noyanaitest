"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { FormRenderer } from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

export type FaqCategoryPopulation = Population<Record<never, never>>;

export interface IFaqCategory<
  T extends FaqCategoryPopulation = FaqCategoryPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

export const FaqCategoryFormRenderer: FormRenderer<IFaqCategory> = {
  name: { type: "text", title: "نام" },
  slug: { type: "text", title: "اسلاگ" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
};

const AdminManageFaqCategoriesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IFaqCategory>
      create={FaqCategoryFormRenderer}
      modelName="faqCategory"
      title="دسته بندی سوالات متداول"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        slug: { name: "اسلاگ", value: (node) => node.slug, filter: "Text" },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: { name: "رتبه", value: (node) => node.order, filter: "Number" },
        actions: {
          name: "غملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/faqCategory/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="faqCategory"
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

export default AdminManageFaqCategoriesPage;
