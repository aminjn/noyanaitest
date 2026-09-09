import { IHospitalAdditionRequest } from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import classes from "./CreateHospitalFromRequestPopup.module.css";
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
import { IHospital } from "../Hospital/AdminManageHospitalsPage";

const CreateHospitalFromRequestPopup = ({
  node,
}: {
  node: IHospitalAdditionRequest;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proceed, setProceed] = useState<boolean>(false);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <PopupCard>
      <p>از ساخت بیمارستان با مشخصات موجود در این درخواست مطمئنید؟</p>
      <ToggleInput
        value={proceed}
        readOnly={isLoading}
        onChange={() => setProceed((prev) => !prev)}
        title="رفتن به صفحه بیمارستان ساخته شده بعد از اتمام عملیات"
      />
      <FormActions>
        <Button onClick={() => setIsLoading(true)}>تایید</Button>
        <Button onClick={() => closePopup()}>انصراف</Button>
      </FormActions>
      <Act<{ data: { data: IHospital } }>
        path={isLoading ? `${API}/auto/hospital` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          if (result && proceed)
            push(adminPath(`/hospital/${result.data.data._id}`));
          closePopup();
        }}
        payload={{
          name: node.hospitalName,
          province: node.province,
          city: node.city,
        }}
      />
    </PopupCard>
  );
};

export default CreateHospitalFromRequestPopup;
