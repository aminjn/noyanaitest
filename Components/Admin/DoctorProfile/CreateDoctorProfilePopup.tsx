import { Fragment } from "react";
import Loading from "../UI/Loading";
import classes from "./CreateDoctorProfilePopup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";

const CreateDoctorProfilePopup = ({ mutate }: { mutate: () => unknown }) => {
  const push = useProgress();

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IDoctorProfile } }>
        path={`${API}/auto/doctorprofile`}
        method="POST"
        onDone={(status, data) => {
          if (!status || !data) return;
          mutate();
          push(adminPath(`/doctorprofile/${data.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateDoctorProfilePopup;
