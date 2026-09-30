"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ClinicCategoryPopulation = Population<Record<never, never>>;

export interface IClinicCategory<
  T extends ClinicCategoryPopulation = ClinicCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  slug?: string;
}

const clinicCategoryFormRenderer: FormRenderer<IClinicCategory> = {
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

const AdminManageClinicCategoriesPage = () => (
  <AdminCatalogList<IClinicCategory>
    model="clinicCategory"
    title={ta("دسته بندی کلینیک")}
    noun={ta("دسته‌بندی کلینیک")}
    fields={clinicCategoryFormRenderer}
  />
);

export default AdminManageClinicCategoriesPage;
