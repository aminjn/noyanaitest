import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import classes from "./CreateDoctorPopup.module.css";
import Act from "@/Components/UI/Act";
import { adminKey, API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { IDoctor } from "./AdminManageDoctorsPage";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateDoctorPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IDoctor } }>
        path={isLoading ? `${API}/auto/doctor` : ""}
        method="POST"
        onDone={(status, data) => {
          setIsLoading(false);
          if (!status || !data) return;
          push(adminPath(`/doctor/${data.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateDoctorPopup;
