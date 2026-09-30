"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ParaClinicTagPopulation = Population<Record<never, never>>;
export interface IParaClinicTag<
  T extends ParaClinicTagPopulation = ParaClinicTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

export const paraClinicTagFormRenderer: FormRenderer<IParaClinicTag> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
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

const AdminManageParaClinicTagsPage = () => (
  <AdminCatalogList<IParaClinicTag>
    model="paraClinicTag"
    title={ta("تگ پاراکلینیک")}
    noun={ta("تگ پاراکلینیک")}
    fields={paraClinicTagFormRenderer}
  />
);

export default AdminManageParaClinicTagsPage;
