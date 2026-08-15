import useForm from "@/Components/Hooks/useForm";
import CreateForm from "../UI/CreateForm";
import { IClinic } from "./AdminManageClinicsPage";
import classes from "./ClinicInfoTab.module.css";
import { API } from "@/Components/config";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import { IClinicCategory } from "../ClinicCategory/AdminManageClinicCategoriesPage";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
import { IClinicTag } from "../ClinicTag/AdminManageClinicTagsPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

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
      renderer={{
        name: { type: "text", title: "نام" },
        image: { type: "image", title: "تصویر" },
        slug: { title: "اسلاگ", type: "text" },
        description: { title: "توصیحات", type: "text" },
        address: { title: "آدرس", type: "text" },
        phone: { title: "شماره تلفن", type: "text" },
        province: {
          title: "استان",
          type: "nodes",
          path: `${API}/auto/province`,
          getOptionLabel: (node) =>
            (node as IProvince).name || (node as IProvince)._id,
          getOptionValue: (node) => (node as IProvince)._id,
          multi: false,
          getDefaultValue: (inp) => inp.province,
        },
        city: {
          title: "شهر",
          type: "nodes",
          getOptionLabel: (node) => (node as ICity).name || (node as ICity)._id,
          getOptionValue: (node) => (node as ICity)._id,
          getDefaultValue: (inp) => inp.city,
          multi: false,
          path: `${API}/auto/city`,
        },
        district: {
          title: "محله",
          getOptionLabel: (node) =>
            (node as IDistrict).name || (node as IDistrict)._id,
          type: "nodes",
          getOptionValue: (node) => (node as IDistrict)._id,
          getDefaultValue: (inp) => inp.district,
          multi: false,
          path: `${API}/auto/district`,
        },
        order: { type: "number", title: "رتبه" },
        active: { type: "bool", title: "فعال" },
        special: { type: "bool", title: "ویژه" },
        category: {
          type: "nodes",
          title: "دسته بندی",
          multi: false,
          getOptionLabel: (node) =>
            (node as IClinicCategory).name || (node as IClinicCategory)._id,
          getOptionValue: (node) => (node as IClinicCategory)._id,
          getDefaultValue: (inp) => inp.category,
          path: `${API}/auto/clinicCategory`,
        },
        isRoundTheClock: { type: "bool", title: "24X7" },
        tags: {
          type: "nodes",
          multi: true,
          title: "تگ ها",
          getOptionLabel: (node) =>
            (node as IClinicTag).name || (node as IClinicTag)._id,
          getOptionValue: (node) => (node as IClinicTag)._id,
          path: `${API}/auto/clinicTag`,
          getDefaultValue: (inp) => inp.tags,
        },
        insurances: {
          type: "nodes",
          multi: true,
          title: "بیمه ها",
          path: `${API}/auto/insurance`,
          getOptionLabel: (node) =>
            (node as IInsurance).name || (node as IInsurance)._id,
          getOptionValue: (node) => (node as IInsurance)._id,
          getDefaultValue: (inp) => inp.insurances,
        },
        clinicCode: { type: "text", title: "کد کلینیک" },
        personelCount: { type: "number", title: "تغداد پرسنل" },
        establishment: { type: "text", title: "تاسیس" },
        website: { type: "text", title: "سایت" },
        mail: { type: "text", title: "ایمیل" },
        businessTimes: { type: "text", title: "ساعات کاری" },
        services: { title: "خدمات", type: "strings" },
        certificates: { title: "اعتبار نامه ها", type: "strings" },
        summary: { type: "text", title: "حلاصه" },
      }}
    />
  );
};

export default ClinicInfoTab;
