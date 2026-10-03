import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ISpeciality } from "../Speciality/AdminManageSpecialitiesPage";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

const genderTitles = (): Record<string, string> => ({
  male: ta("مرد"),
  female: ta("زن"),
});

// One form for the whole doctor record, in titled sections (identity,
// speciality, contact, introduction, visibility), like the single record
// page of Doctolib Pro / Docplanner back-offices. Speciality used to be a
// tab of its own with two fields; gender was missing although the public
// search filters doctors by it (publicController, `gender`).
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

  const identity = ta("هویت");
  const speciality = ta("تخصص");
  const contact = ta("تماس و آدرس");
  const about = ta("معرفی و خدمات");
  const visibility = ta("نمایش در سایت");

  const specialityFields: FormRenderer<IDoctorProfile> = hasAccess(
    "Sepciality",
    "readAll",
  )
    ? {
        mainSpeciality: {
          title: ta("تخصص اصلی"),
          type: "nodes",
          multi: false,
          path: `${API}/auto/speciality`,
          // a missing speciality is added from here, live (Speciality uses
          // `active`, not `isActive`)
          creatable: { path: `${API}/auto/speciality`, extra: { active: true } },
          getOptionLabel: (node) =>
            (node as ISpeciality).name || ta("بدون نام"),
          getOptionValue: (node) => (node as ISpeciality)._id,
          getDefaultValue: (node) => node.mainSpeciality,
          section: speciality,
        },
        specialities: {
          title: ta("تخصص‌ها"),
          type: "nodes",
          path: `${API}/auto/speciality`,
          // a missing speciality is added from here, live (Speciality uses
          // `active`, not `isActive`)
          creatable: { path: `${API}/auto/speciality`, extra: { active: true } },
          multi: true,
          getOptionLabel: (node) =>
            (node as ISpeciality).name || ta("بدون نام"),
          getOptionValue: (node) => (node as ISpeciality)._id,
          getDefaultValue: (node) => node.specialities,
          section: speciality,
        },
      }
    : {};

  return (
    <CreateForm
      readOnly={!hasAccess("DoctorProfile", "update")}
      defaultValue={node}
      styleManaged
      layout="sections"
      renderer={{
        firstName: { type: "text", title: ta("نام"), section: identity },
        lastName: {
          type: "text",
          title: ta("نام خانوادگی"),
          section: identity,
        },
        gender: {
          type: "select",
          title: ta("جنسیت"),
          options: genderTitles(),
          section: identity,
        },
        medicalSystemCode: {
          type: "text",
          title: ta("کد نظام پزشکی"),
          section: identity,
        },
        slug: { type: "text", title: ta("اسلاگ"), section: identity },
        avatar: { type: "image", title: ta("تصویر اصلی"), section: identity },
        ...specialityFields,
        landLine: { type: "text", title: ta("تلفن ثابت"), section: contact },
        website: { type: "text", title: ta("سایت"), section: contact },
        introduction: { type: "area", title: ta("معرفی"), section: about },
        services: { type: "strings", title: ta("خدمات"), section: about },
        achivements: {
          type: "strings",
          title: ta("دستاوردها"),
          section: about,
        },
        active: { type: "bool", title: ta("فعال"), section: visibility },
        popular: { type: "bool", title: ta("محبوب"), section: visibility },
        order: { type: "number", title: ta("رتبه"), section: visibility },
      }}
      hookProvided={form}
    />
  );
};

export default DoctorProfileInfoTab;
