"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

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

const AdminManageInsuranceCategoriesPage = () => (
  <AdminCatalogList<IInsuranceCategory>
    model="insuranceCategory"
    title={ta("دسته بندی بیمه ها")}
    noun={ta("دسته‌بندی بیمه")}
    fields={insuranceCategoryFormRenderer}
  />
);

export default AdminManageInsuranceCategoriesPage;
