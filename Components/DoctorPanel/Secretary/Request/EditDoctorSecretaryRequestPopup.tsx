import CreateForm from "@/Components/Admin/UI/CreateForm";
import { IDoctorSecretaryRequest } from "./DoctorSecretaryRequestsTab";
import classes from "./EditDoctorSecretaryRequestPopup.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import { getDoctorSecretaryAccessLavelLabel } from "@/Components/Admin/Lib/LabelGetters";
import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";

const EditDoctorSecretaryRequestPopup = ({
  mutate,
  node,
}: {
  node: IDoctorSecretaryRequest<{ AccessLevel: true }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm
        className={classes.main}
        defaultValue={node}
        hookProps={{
          path: `${API}/doctor/secretaryrequest/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
        renderer={{
          displayName: { type: "text", title: getContent("phone") },
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
          message: { type: "area", title: getContent("message") },
        }}
      />
    </PopupCard>
  );
};

export default EditDoctorSecretaryRequestPopup;
