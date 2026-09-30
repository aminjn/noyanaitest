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
import { ta } from "@/Components/Admin/i18n/adminText";

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
        firstName: { type: "text", title: ta("نام") },
        lastName: { type: "text", title: ta("نام خانوادگی") },
        slug: { type: "text", title: ta("اسلاگ") },
        medicalSystemCode: {
          type: "text",
          title: ta("کد نظام پزشکی"),
        },
        address: { type: "text", title: ta("آدرس") },
        landLine: { type: "text", title: ta("تلفن ثابت") },
        website: { type: "text", title: ta("سایت") },
        introduction: { type: "area", title: ta("معرفی") },
        services: { type: "strings", title: ta("خدمات") },
        achivements: { type: "strings", title: ta("دستاوردها") },
        active: { type: "bool", title: ta("فعال") },
        order: { type: "number", title: ta("رتبه") },
        avatar: { type: "image", title: ta("تصویر اصلی") },
        popular: { type: "bool", title: ta("محبوب") },
        tier: {
          type: "select",
          title: ta("رده"),
          options: doctorProfileTiers.reduce(
            (acc, el) => ({ ...acc, [el]: el }),
            {},
          ),
        },
        province: {
          title: ta("استان"),
          type: "nodes",
          path: `${API}/auto/province`,
          getOptionLabel: (node) =>
            (node as IProvince).name || (node as IProvince)._id,
          getOptionValue: (node) => (node as IProvince)._id,
          multi: false,
          getDefaultValue: (inp) => inp.province,
        },
        city: {
          title: ta("شهر"),
          type: "nodes",
          getOptionLabel: (node) => (node as ICity).name || (node as ICity)._id,
          getOptionValue: (node) => (node as ICity)._id,
          getDefaultValue: (inp) => inp.city,
          multi: false,
          path: `${API}/auto/city`,
        },
        district: {
          title: ta("محله"),
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
