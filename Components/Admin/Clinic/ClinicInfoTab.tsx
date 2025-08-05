import useForm from "@/Components/Hooks/useForm";
import CreateForm from "../UI/CreateForm";
import { IClinic } from "./AdminManageClinicsPage";
import classes from "./ClinicInfoTab.module.css";
import { API } from "@/Components/config";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";

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
        slug: { title: "اسلاگ", type: "text" },
        description: { title: "توصیحات", type: "text" },
        address: { title: "آدرس", type: "text" },
        phone: { title: "شماره تلفن", type: "text" },
        province: { title: "استان", type: "select", options: provinceOptions },
        city: {
          title: "شهر",
          type: "select",
          options: cityOptions(form.input.province || clinic.province),
        },
        order: { type: "number", title: "رتبه" },
        active: { type: "bool", title: "فعال" },
      }}
    />
  );
};

export default ClinicInfoTab;
