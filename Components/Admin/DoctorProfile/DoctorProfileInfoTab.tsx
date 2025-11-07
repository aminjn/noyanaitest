import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfileInfoTab.module.css";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import { provinceOptions, provinces } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

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
        province: {
          type: "select",
          title: "استان",
          options: provinceOptions,
        },
        city: {
          type: "select",
          title: "شهر",
          options: cityOptions(form.input.province || node.province),
        },
        introduction: { type: "area", title: "معرفی" },
        services: { type: "strings", title: "خدمات" },
        achivements: { type: "strings", title: "دستاوردها" },
        active: { type: "bool", title: "فعال" },
        order: { type: "number", title: "رتبه" },
        avatar: { type: "image", title: "تصویر اصلی" },
      }}
      hookProvided={form}
    />
  );
};

export default DoctorProfileInfoTab;
