import { Fragment, useState } from "react";
import classes from "./CreateDoctorSecretaryAccessLevelPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDoctorSecretaryAccessLevel } from "./AdminManageDoctorSecretaryAccessLevelsPage";

const CreateDoctorSecretaryAccessLevelPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IDoctorSecretaryAccessLevel } }>
        path={isLoading ? `${API}/auto/doctorsecretaryaccesslevel` : null}
        method="POST"
        onDone={(status, result) => {
          if (status) {
            mutate();
            if (result)
              push(
                adminPath(`/doctorsecretaryaccesslevel/${result.data.data._id}`)
              );
          }
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateDoctorSecretaryAccessLevelPopup;
