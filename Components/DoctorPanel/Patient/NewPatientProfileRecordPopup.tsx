import PopupCard from "@/Components/UI/PopupCard";
import classes from "./NewPatientProfileRecordPopup.module.css";
import { IPatientProfile, IPatientProfileRecord } from "./PatientFiles";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";
import { title } from "process";

const NewPatientProfileRecordPopup = ({
  mutate,
  profile,
}: {
  profile: IPatientProfile;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm<IPatientProfileRecord>
        className={classes.main}
        onCancel={() => closePopup()}
        renderer={{
          title: { type: "text", title: getContent("title") },
          description: { type: "area", title: getContent("description") },
          isPublic: { type: "bool", title: getContent("isRecordPublic") },
          files: {
            type: "files",
            title: getContent("patientProfileRecordAttachments"),
          },
        }}
        hookProps={{
          path: `${API}/doctor/patient/record/${profile._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default NewPatientProfileRecordPopup;
