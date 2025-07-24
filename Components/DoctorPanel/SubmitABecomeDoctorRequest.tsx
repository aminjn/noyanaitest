import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import { cities } from "../Enums/Cities";
import { provinces } from "../Enums/Provinces";
import useForm from "../Hooks/useForm";
import useLocale from "../Hooks/useLocale";
import {
  genders,
  IBecomeDoctorRequest,
  medicalSystemTitles,
} from "./DoctorPanelPage";
import classes from "./SubmitABecomeDoctorRequest.module.css";

const SubmitABecomeDoctorRequest = ({
  mutate,
  defaultValue,
}: {
  defaultValue?: IBecomeDoctorRequest;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const form = useForm<IBecomeDoctorRequest>({
    path: `${API}/doctor`,
    method: "POST",
    successCb: () => mutate(),
  });

  return (
    <CreateForm
      defaultValue={defaultValue}
      styleManaged
      renderer={{
        firstName: { type: "text", title: "نام" },
        lastName: { type: "text", title: "نام خانوادگی" },
        ssid: { type: "text", title: "کد ملی" },
        gender: {
          type: "select",
          title: "جنسیت",
          options: genders.reduce(
            (acc, el) => ({ ...acc, [el]: getContent(el) }),
            {}
          ),
        },
        medicalSystemTitle: {
          type: "select",
          title: getContent("medicalSystemTitle"),
          options: medicalSystemTitles.reduce(
            (acc, el) => ({ ...acc, [el]: el }),
            {}
          ),
        },
        medicalSystemCode: {
          type: "text",
          title: getContent("medicalSystemCode"),
        },
        specialities: {
          type: "nodes",
          title: getContent("specialities"),
          multi: true,
          path: `${API}/public/selectspeciality`,
          getOptionLabel: (node) =>
            (node as ISpeciality).name || (node as ISpeciality)._id,
          getOptionValue: (node) => (node as ISpeciality)._id,
        },
        province: {
          type: "select",
          title: getContent("province"),
          options: provinces.reduce(
            (acc, p) => ({ ...acc, [p.slug]: p.name }),
            {}
          ),
        },
        city: {
          type: "select",
          title: getContent("city"),
          options: form.input.province
            ? cities
                .filter(
                  (c) =>
                    c.province_id ===
                    provinces.find((p) => p.slug === form.input.province)?.id
                )
                .reduce((acc, el) => ({ ...acc, [el.slug]: el.name }), {})
            : {},
        },
        address: { type: "text", title: getContent("address") },
        description: { type: "text", title: getContent("description") },
      }}
      hookProvided={form}
    />
  );
};

export default SubmitABecomeDoctorRequest;
