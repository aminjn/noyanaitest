import PopupCard from "@/Components/UI/PopupCard";
import Form from "@/Components/UI/Form";
import useForm from "@/Components/Hooks/useForm";
import { IClinicAdditionRequest } from "./DoctorClinicAdditionsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const SubmitClinicAdditionRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  const form = useForm<IClinicAdditionRequest>({
    path: `${API}/doctor/clinicaddition`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
    hasProblem: (inp) => {
      if (
        !inp.clinicName ||
        !inp.clinicAddress ||
        !inp.province ||
        !inp.city ||
        !inp.ownerName ||
        !inp.ownerPhone
      )
        return getContent("checkInput");
    },
  });

  return (
    <PopupCard>
      <CreateForm
        hookProvided={form}
        onCancel={() => closePopup()}
        renderer={{
          clinicName: { title: getContent("clinicName"), type: "text" },
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
          clinicAddress: { title: getContent("clinicAddress"), type: "area" },
          description: { title: getContent("description"), type: "area" },
        }}
      />
    </PopupCard>
  );
};

export default SubmitClinicAdditionRequestPopup;
