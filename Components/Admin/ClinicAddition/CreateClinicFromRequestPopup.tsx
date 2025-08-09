import { IClinicAdditionRequest } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import classes from "./CreateClinicFromRequestPopup.module.css";
import { useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import ToggleInput from "@/Components/UI/ToggleInput";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { IClinic } from "../Clinic/AdminManageClinicsPage";

const CreateClinicFromRequestPopup = ({
  node,
}: {
  node: IClinicAdditionRequest;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proceed, setProceed] = useState<boolean>(false);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <PopupCard>
      <p>از ساخت کلینیک با مشخصات موجود در این درخواست مطمئنید؟</p>
      <ToggleInput
        value={proceed}
        readOnly={isLoading}
        onChange={() => setProceed((prev) => !prev)}
        title="رفتن به صفحه کلینیک ساخته شده بعد از اتمام عملیات"
      />
      <FormActions>
        <Button onClick={() => setIsLoading(true)}>تایید</Button>
        <Button onClick={() => closePopup()}>انصراف</Button>
      </FormActions>
      <Act<{ data: { data: IClinic } }>
        path={isLoading ? `${API}/auto/clinic` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          if (result && proceed)
            push(adminPath(`/clinic/${result.data.data._id}`));
          closePopup();
        }}
        payload={{
          name: node.clinicName,
          province: node.province,
          city: node.city,
        }}
      />
    </PopupCard>
  );
};

export default CreateClinicFromRequestPopup;
