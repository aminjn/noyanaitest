import classes from "./NewPatientFilePopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { IPatientProfile } from "./PatientFiles";
import { API } from "@/Components/config";

const NewPatientFilePopup = ({
  mutate,
  patientId,
}: {
  mutate: () => unknown;
  patientId: string;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm<IPatientProfile>
        className={classes.main}
        renderer={{
          title: { type: "text", title: getContent("title") },
          description: { type: "area", title: getContent("description") },
          diagnosis: { type: "text", title: getContent("diagnosis") },
        }}
        hookProps={{
          path: `${API}/doctor/patient/file/${patientId}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default NewPatientFilePopup;
