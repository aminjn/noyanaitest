import useForm from "@/Components/Hooks/useForm";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import { IClinic } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import { IClinicCategory } from "../ClinicCategory/AdminManageClinicCategoriesPage";
import { IClinicTag } from "../ClinicTag/AdminManageClinicTagsPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { ta } from "@/Components/Admin/i18n/adminText";
import { centreTagCreatable } from "../UI/centreTagCreatable";

// The clinic's record fields: the info tab of a saved clinic and the one
// form of a new one (AdminManageClinicPage, `/clinic/new`)
export const clinicInfoRenderer = (): FormRenderer<IClinic> => ({
  name: { type: "text", title: ta("نام"), required: true },
  image: { type: "image", title: ta("تصویر") },
  slug: { title: ta("اسلاگ"), type: "text" },
  description: { title: ta("توضیحات"), type: "area" },
  phone: { title: ta("شماره تلفن"), type: "text", section: ta("تماس") },
  order: { type: "number", title: ta("رتبه") },
  active: { type: "bool", title: ta("فعال") },
  special: { type: "bool", title: ta("ویژه") },
  category: {
    type: "nodes",
    title: ta("دسته بندی"),
    multi: false,
    getOptionLabel: (node) =>
      (node as IClinicCategory).name || (node as IClinicCategory)._id,
    getOptionValue: (node) => (node as IClinicCategory)._id,
    getDefaultValue: (inp) => inp.category,
    path: `${API}/auto/clinicCategory`,
    creatable: { path: `${API}/auto/clinicCategory` },
  },
  tags: {
    type: "nodes",
    multi: true,
    title: ta("تگ ها"),
    getOptionLabel: (node) =>
      (node as IClinicTag).name || (node as IClinicTag)._id,
    getOptionValue: (node) => (node as IClinicTag)._id,
    path: `${API}/auto/clinicTag`,
    creatable: centreTagCreatable(`${API}/auto/clinicTag`),
    getDefaultValue: (inp) => inp.tags,
  },
  // the insurers with an active contract (2026-10): they change through
  // the contract (the centre's panel and the insurer's), not here
  insurances: {
    type: "nodes",
    readOnly: true,
    hint: ta("از قراردادهای فعال بیمه می‌آید و از اینجا تغییر نمی‌کند"),
    multi: true,
    title: ta("بیمه ها"),
    section: ta("بیمه‌ها"),
    path: `${API}/auto/insurance`,
    getOptionLabel: (node) =>
      (node as IInsurance).name || (node as IInsurance)._id,
    getOptionValue: (node) => (node as IInsurance)._id,
    getDefaultValue: (inp) => inp.insurances,
  },
  // the licence number (clinicCode) is edited with its verification in the
  // «مجوز» tab (CentreLicenceSection): a number changed here skipped the check
  personelCount: { type: "number", title: ta("تعداد پرسنل") },
  establishment: { type: "text", title: ta("تاسیس") },
  website: { type: "text", title: ta("سایت"), section: ta("تماس") },
  mail: { type: "text", title: ta("ایمیل"), section: ta("تماس") },
  // the structured week (2026-10, backend Lib/openingHours.ts): its
  // round-the-clock switch is the centre's isRoundTheClock
  openingHours: { type: "openingHours", title: ta("ساعات کاری هفتگی") },
  businessTimes: {
    type: "text",
    title: ta("یادداشت ساعات کاری"),
    section: ta("تماس"),
  },
  services: { title: ta("خدمات"), type: "strings" },
  certificates: { title: ta("اعتبار نامه ها"), type: "strings" },
  summary: { type: "area", title: ta("خلاصه") },
});

const ClinicInfoTab = ({
  clinic,
  mutate,
}: {
  clinic: IClinic;
  mutate: () => unknown;
}) => {
  const form = useForm<IClinic>({
    path: `${API}/auto/clinic/${clinic._id}`,
    method: "POST",
    successCb: () => mutate(),
  });

  return (
    <CreateForm
      defaultValue={clinic}
      hookProvided={form}
      layout="sections"
      renderer={clinicInfoRenderer()}
    />
  );
};

export default ClinicInfoTab;
