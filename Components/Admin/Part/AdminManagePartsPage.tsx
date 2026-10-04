"use client";

import { IPart, PartRegion, partRegions } from "../Disease/AdminManageDiseasesPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

// where a part is drawn on the public symptom map (/symptom)
const regionLabels: Record<PartRegion, () => string> = {
  head: () => ta("سر"),
  neck: () => ta("گردن"),
  chest: () => ta("قفسه‌ی سینه"),
  abdomen: () => ta("شکم"),
  pelvis: () => ta("لگن"),
  back: () => ta("کمر و پشت"),
  arms: () => ta("دست‌ها"),
  legs: () => ta("پاها"),
  skin: () => ta("پوست"),
  general: () => ta("کل بدن (عمومی)"),
};
// translated when shown (a ta() call at module level runs too early)
const regionOptions: Record<string, string> = {};
Object.defineProperty(regionOptions, "", { get: () => ta("نامشخص"), enumerable: true });
for (const r of partRegions)
  Object.defineProperty(regionOptions, r, { get: () => regionLabels[r](), enumerable: true });

const partFormRenderer: FormRenderer<IPart> = {
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
  region: {
    type: "select",
    get title() {
      return ta("ناحیه روی نقشه‌ی بدن");
    },
    options: regionOptions,
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

// body parts / systems: the medical directory's "by body part" pages
// (/disease/part/<slug>, /symptom/part/<slug>) and the symptom body map
const AdminManagePartsPage = () => (
  <AdminCatalogList<IPart>
    model="part"
    title={ta("اعضای بدن")}
    noun={ta("عضو بدن")}
    fields={partFormRenderer}
  />
);

export default AdminManagePartsPage;
