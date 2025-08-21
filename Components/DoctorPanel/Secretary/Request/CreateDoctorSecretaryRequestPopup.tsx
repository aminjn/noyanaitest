import CreateForm from "@/Components/Admin/UI/CreateForm";
import classes from "./CreateDoctorSecretaryRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { DoctorProfilePopulation, IDoctorProfile } from "../../DoctorPanelPage";
import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import { IDoctorSecretaryRequest } from "./DoctorSecretaryRequestsTab";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import PopupCard from "@/Components/UI/PopupCard";
import { getDoctorSecretaryAccessLavelLabel } from "@/Components/Admin/Lib/LabelGetters";

export type DoctorSecretaryPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Secretary: true;
  AccessLevel: boolean;
}>;

export interface IDoctorSecretary<
  T extends DoctorSecretaryPopulation = DoctorSecretaryPopulation
> extends MongoDoc {
  doctor?: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  secretary?: T["Secretary"] extends true ? IUser : string;
  accessLevel?: T["AccessLevel"] extends true
    ? IDoctorSecretaryAccessLevel
    : string;
  displayName?: string;
}

const CreateDoctorSecretaryRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm<IDoctorSecretaryRequest>
        className={classes.main}
        onCancel={() => closePopup()}
        renderer={{
          phone: { type: "text", title: getContent("phone") },
          displayName: { type: "text", title: getContent("displayName") },
          accessLevel: {
            type: "nodes",
            path: `${API}/doctor/accesslevel`,
            title: getContent("accessLevel"),
            getOptionLabel: (node) =>
              getDoctorSecretaryAccessLavelLabel(
                node as IDoctorSecretaryAccessLevel
              ),
            getOptionValue: (node) => (node as IDoctorSecretaryAccessLevel)._id,
            dataParser: (res) =>
              (res as Record<"data", IDoctorSecretaryAccessLevel[]>).data,
            clearable: true,
          },
          message: { type: "area", title: getContent("message") },
        }}
        hookProps={{
          path: `${API}/doctor/secretaryrequest`,
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

export default CreateDoctorSecretaryRequestPopup;
