"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
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
  name: {
    type: "text",
    get title() {
      return ta("نام");
    },
  },
  slug: {
    type: "text",
    get title() {
      return ta("اسلاگ");
    },
  },
  isActive: {
    type: "bool",
    get title() {
      return ta("فعال");
    },
  },
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

const AdminManageSymptomCategoriesPage = () => (
  <AdminCatalogList<ISymptomCategory>
    model="symptomCategory"
    title={ta("دسته بندی علائم")}
    noun={ta("دسته‌بندی علامت")}
    fields={symptomCategoryFormRenderer}
  />
);

export default AdminManageSymptomCategoriesPage;
