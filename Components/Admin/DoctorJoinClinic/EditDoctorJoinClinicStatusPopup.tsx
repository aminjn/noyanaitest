import { IDoctorJoinClinicRequest } from "@/Components/DoctorPanel/Clinic/DoctorJoinClinicsTab";
import classes from "./EditDoctorJoinClinicStatusPopup.module.css";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { getClinicLabel, getDoctorLabel } from "../Lib/LabelGetters";

const EditDoctorJoinClinicStatusPopup = ({
  mutate,
  node,
}: {
  node: IDoctorJoinClinicRequest<{
    Clinic: Record<never, never>;
    Doctor: Record<never, never>;
  }>;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={`از اتصال دکتر ${
          node.doctor ? getDoctorLabel(node.doctor) : ""
        } به کلینیک ${node.clinic ? getClinicLabel(node.clinic) : ""} مطمئنید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/clinicdoctor` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
        payload={{ clinic: node.clinic?._id, doctor: node.doctor?._id }}
      />
    </Fragment>
  );
};

export default EditDoctorJoinClinicStatusPopup;
