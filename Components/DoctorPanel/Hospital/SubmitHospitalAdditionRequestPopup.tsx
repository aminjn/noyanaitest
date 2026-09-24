import Box from "@/Components/Admin/UI/Box";
import classes from "./SubmitHospitalAdditionRequestPopup.module.css";
import Form from "@/Components/UI/Form";
import useForm from "@/Components/Hooks/useForm";
import { IHospitalAdditionRequest } from "./DoctorHospitalAdditionsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

const SubmitHospitalAdditionRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  const form = useForm<IHospitalAdditionRequest>({
    path: `${API}/doctor/hospitaladdition`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
    hasProblem: (inp) => {
      if (
        !inp.hospitalName ||
        !inp.hospitalAddress ||
        !inp.province ||
        !inp.city ||
        !inp.ownerName ||
        !inp.ownerPhone
      )
        return getContent("checkInput");
    },
  });

  return (
    <Box className={classes.main}>
      <CreateForm
        hookProvided={form}
        onCancel={() => closePopup()}
        renderer={{
          hospitalName: { title: getContent("hospitalName"), type: "text" },
          ownerName: { title: getContent("ownerName"), type: "text" },
          ownerPhone: { title: getContent("ownerPhone"), type: "text" },
          province: {
            title: getContent("province"),
            type: "select",
            options: provinceOptions,
          },
          city: {
            title: getContent("city"),
            type: "select",
            options: cityOptions(form.input.province),
          },
          hospitalAddress: { title: getContent("hospitalAddress"), type: "area" },
          description: { title: getContent("description"), type: "area" },
        }}
      />
    </Box>
  );
};

export default SubmitHospitalAdditionRequestPopup;
