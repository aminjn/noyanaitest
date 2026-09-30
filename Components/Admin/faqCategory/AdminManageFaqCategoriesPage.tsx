"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

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

const AdminManageFaqCategoriesPage = () => (
  <AdminCatalogList<IFaqCategory>
    model="faqCategory"
    title={ta("دسته بندی سوالات متداول")}
    noun={ta("دسته‌بندی سوال متداول")}
    fields={FaqCategoryFormRenderer}
  />
);

export default AdminManageFaqCategoriesPage;
