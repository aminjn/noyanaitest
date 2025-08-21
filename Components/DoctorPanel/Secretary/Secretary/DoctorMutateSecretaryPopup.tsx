import PopupCard from "@/Components/UI/PopupCard";
import { IDoctorSecretary } from "../Request/CreateDoctorSecretaryRequestPopup";
import classes from "./DoctorMutateSecretaryPopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import { getDoctorSecretaryAccessLavelLabel } from "@/Components/Admin/Lib/LabelGetters";
import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import usePopup from "@/Components/Hooks/usePopup";

const DoctorMutateSecretaryPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IDoctorSecretary<{ AccessLevel: true }>;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
          accessLevel: {
            type: "nodes",
            path: `${API}/doctor/accesslevel`,
            title: getContent("accessLevel"),
            getOptionLabel: (node) =>
              getDoctorSecretaryAccessLavelLabel(
                node as IDoctorSecretaryAccessLevel
              ),
            getOptionValue: (node) => (node as IDoctorSecretaryAccessLevel)._id,
            getDefaultValue: (node) => node.accessLevel?._id,
            dataParser: (res) =>
              (res as Record<"data", IDoctorSecretaryAccessLevel[]>).data,
            clearable: true,
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/doctor/secretary/${node._id}`,
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

export default DoctorMutateSecretaryPopup;
