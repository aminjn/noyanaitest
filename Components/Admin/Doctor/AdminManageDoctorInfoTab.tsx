import { API } from "@/Components/config";
import classes from "./AdminManageDoctorInfoTab.module.css";
import { IDoctor } from "./AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import useForm from "@/Components/Hooks/useForm";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorInfoTab = ({
  mutate,
  node,
}: {
  node: IDoctor;
  mutate: () => unknown;
}) => {
  const form = useForm<IDoctor>({
    path: `${API}/auto/doctor/${node._id}`,
    method: "POST",
    successCb: () => mutate(),
  });

  const hasAccess = useAccessLevel();

  return (
    <CreateForm
      readOnly={!hasAccess("Doctor", "update")}
      defaultValue={node}
      hookProvided={form}
      renderer={{
        name: { type: "text", title: ta("نام") },
        slug: { type: "text", title: ta("اسلاگ") },
        image: { type: "image", title: ta("تصویر") },
        code: { type: "text", title: ta("کد") },
        hours: { type: "area", title: ta("ساعات کاری") },
        awards: { type: "area", title: ta("جوائز") },
        birthDate: { type: "date", title: ta("تاریخ تولد") },
        description: { type: "area", title: ta("توضیحات") },
        summary: { type: "text", title: ta("خلاصه") },
        order: { type: "number", title: ta("رتبه") },
        active: { type: "bool", title: ta("فعال") },
        address: { type: "text", title: ta("آدرس") },
        landLine: { type: "text", title: ta("تلفن ثابت") },
        mobile: { type: "text", title: ta("موبایل") },
        email: { type: "text", title: ta("ایمیل") },
        province: { type: "select", options: provinceOptions, title: ta("استان") },
        city: {
          type: "select",
          options: cityOptions(form.input.province || node.province),
          title: ta("شهر"),
        },
        lat: { type: "number", title: ta("عرض") },
        lng: { type: "number", title: ta("طول") },
        site: { type: "text", title: ta("سایت") },
        telegram: { type: "text", title: ta("تلگرام") },
        twitter: { type: "text", title: ta("توییتر") },
        youtube: { type: "text", title: ta("یوتیوب") },
        aparat: { type: "text", title: ta("آپارات") },
        linkedin: { type: "text", title: ta("لینکدین") },
        instagram: { type: "text", title: ta("اینستاگرام") },
      }}
    />
  );
};

export default AdminManageDoctorInfoTab;
