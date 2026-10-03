import useForm from "@/Components/Hooks/useForm";
import CreateForm from "../UI/CreateForm";
import { IClinic } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import { IClinicCategory } from "../ClinicCategory/AdminManageClinicCategoriesPage";
import { IClinicTag } from "../ClinicTag/AdminManageClinicTagsPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { ta } from "@/Components/Admin/i18n/adminText";

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
      renderer={{
        name: { type: "text", title: ta("نام") },
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
        isRoundTheClock: { type: "bool", title: ta("شبانه‌روزی") },
        tags: {
          type: "nodes",
          multi: true,
          title: ta("تگ ها"),
          getOptionLabel: (node) =>
            (node as IClinicTag).name || (node as IClinicTag)._id,
          getOptionValue: (node) => (node as IClinicTag)._id,
          path: `${API}/auto/clinicTag`,
          creatable: { path: `${API}/auto/clinicTag` },
          getDefaultValue: (inp) => inp.tags,
        },
        insurances: {
          type: "nodes",
          multi: true,
          title: ta("بیمه ها"),
          section: ta("بیمه‌ها"),
          path: `${API}/auto/insurance`,
          getOptionLabel: (node) =>
            (node as IInsurance).name || (node as IInsurance)._id,
          getOptionValue: (node) => (node as IInsurance)._id,
          getDefaultValue: (inp) => inp.insurances,
        },
        clinicCode: { type: "text", title: ta("کد کلینیک") },
        personelCount: { type: "number", title: ta("تعداد پرسنل") },
        establishment: { type: "text", title: ta("تاسیس") },
        website: { type: "text", title: ta("سایت"), section: ta("تماس") },
        mail: { type: "text", title: ta("ایمیل"), section: ta("تماس") },
        businessTimes: {
          type: "text",
          title: ta("ساعات کاری"),
          section: ta("تماس"),
        },
        services: { title: ta("خدمات"), type: "strings" },
        certificates: { title: ta("اعتبار نامه ها"), type: "strings" },
        summary: { type: "area", title: ta("خلاصه") },
      }}
    />
  );
};

export default ClinicInfoTab;
