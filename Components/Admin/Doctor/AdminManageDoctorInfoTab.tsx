import { API } from "@/Components/config";
import classes from "./AdminManageDoctorInfoTab.module.css";
import { IDoctor } from "./AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import useForm from "@/Components/Hooks/useForm";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

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
        name: { type: "text", title: "نام" },
        slug: { type: "text", title: "اسلاگ" },
        image: { type: "image", title: "تصویر" },
        code: { type: "text", title: "کد" },
        hours: { type: "area", title: "ساعات کاری" },
        awards: { type: "area", title: "جوائز" },
        birthDate: { type: "date", title: "تاریخ تولد" },
        description: { type: "area", title: "توضیحات" },
        summary: { type: "text", title: "خلاصه" },
        order: { type: "number", title: "رتبه" },
        active: { type: "bool", title: "فعال" },
        address: { type: "text", title: "آدرس" },
        landLine: { type: "text", title: "تلفن ثابت" },
        mobile: { type: "text", title: "موبایل" },
        email: { type: "text", title: "ایمیل" },
        province: { type: "select", options: provinceOptions, title: "استان" },
        city: {
          type: "select",
          options: cityOptions(form.input.province || node.province),
          title: "شهر",
        },
        lat: { type: "number", title: "عرض" },
        lng: { type: "number", title: "طول" },
        site: { type: "text", title: "سایت" },
        telegram: { type: "text", title: "تلگرام" },
        twitter: { type: "text", title: "توییتر" },
        youtube: { type: "text", title: "یوتیوب" },
        aparat: { type: "text", title: "آپارات" },
        linkedin: { type: "text", title: "لینکدین" },
      }}
    />
  );
};

export default AdminManageDoctorInfoTab;
