"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type TestCategoryPopulation = Population<Record<never, never>>;

export interface ITestCategory<
  T extends TestCategoryPopulation = TestCategoryPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  slug?: string;
}

const testCategoryFormRenderer: FormRenderer<ITestCategory> = {
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

const AdminManageTestCategoriesPage = () => (
  <AdminCatalogList<ITestCategory>
    model="testCategory"
    title={ta("دسته بندی تست ها")}
    noun={ta("دسته‌بندی آزمایش")}
    fields={testCategoryFormRenderer}
  />
);

export default AdminManageTestCategoriesPage;
