import {
  doctorProfileTiers,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfileInfoTab.module.css";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import { provinceOptions, provinces } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ICity, IDistrict, IProvince } from "../Province/AdminManageProvincesPage";

const DoctorProfileInfoTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const form = useForm<IDoctorProfile>({
    path: `${API}/auto/doctorprofile/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
  });

  const hasAccess = useAccessLevel();

  return (
    <CreateForm
      readOnly={!hasAccess("DoctorProfile", "update")}
      defaultValue={node}
      styleManaged
      renderer={{
        firstName: { type: "text", title: "نام" },
        lastName: { type: "text", title: "نام خانوادگی" },
        slug: { type: "text", title: "اسلاگ" },
        medicalSystemCode: {
          type: "text",
          title: "کد نظام پزشکی",
        },
        address: { type: "text", title: "آدرس" },
        landLine: { type: "text", title: "تلفن ثابت" },
        website: { type: "text", title: "سایت" },
        introduction: { type: "area", title: "معرفی" },
        services: { type: "strings", title: "خدمات" },
        achivements: { type: "strings", title: "دستاوردها" },
        active: { type: "bool", title: "فعال" },
        order: { type: "number", title: "رتبه" },
        avatar: { type: "image", title: "تصویر اصلی" },
        popular: { type: "bool", title: "محبوب" },
        tier: {
          type: "select",
          title: "رده",
          options: doctorProfileTiers.reduce(
            (acc, el) => ({ ...acc, [el]: el }),
            {},
          ),
        },
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
      }}
      hookProvided={form}
    />
  );
};

export default DoctorProfileInfoTab;
