"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type DiseaseCategoryPopuplation = Population<Record<never, never>>;

export interface IDiseaseCategory<
  T extends DiseaseCategoryPopuplation = DiseaseCategoryPopuplation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

const diseaseCategoryFormRenderer: FormRenderer<IDiseaseCategory> = {
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

const AdminManageDiseaseCategoriesPage = () => (
  <AdminCatalogList<IDiseaseCategory>
    model="diseaseCategory"
    title={ta("دسته بندی بیماری ها")}
    noun={ta("دسته‌بندی بیماری")}
    fields={diseaseCategoryFormRenderer}
  />
);

export default AdminManageDiseaseCategoriesPage;
