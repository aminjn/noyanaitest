import { IDoctorJoinHospitalRequest } from "@/Components/DoctorPanel/Hospital/DoctorJoinHospitalsTab";
import classes from "./EditDoctorJoinHospitalStatusPopup.module.css";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import {
  getHospitalLabel,
  getDoctorLabel,
  getDoctorProfileLabel,
} from "../Lib/LabelGetters";

const EditDoctorJoinHospitalStatusPopup = ({
  mutate,
  node,
}: {
  node: IDoctorJoinHospitalRequest<{
    Hospital: Record<never, never>;
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
          node.doctor ? getDoctorProfileLabel(node.doctor) : ""
        } به بیمارستان ${node.hospital ? getHospitalLabel(node.hospital) : ""} مطمئنید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/hospitaldoctor` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
        payload={{ hospital: node.hospital?._id, doctor: node.doctor?._id }}
      />
    </Fragment>
  );
};

export default EditDoctorJoinHospitalStatusPopup;
