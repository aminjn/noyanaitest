import { IInsuranceAdditionRequest } from "@/Components/DoctorPanel/Insurance/DoctorInsuranceAdditionRequestsTab";
import classes from "./CreateInsuranceFromRequestPopup.module.css";
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
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

const CreateInsuranceFromRequestPopup = ({
  node,
}: {
  node: IInsuranceAdditionRequest;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proceed, setProceed] = useState<boolean>(false);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <PopupCard>
      <p>از ساخت بیمه با مشخصات موجود در این درخواست مطمئنید؟</p>
      <ToggleInput
        value={proceed}
        readOnly={isLoading}
        onChange={() => setProceed((prev) => !prev)}
        title="رفتن به صفحه بیمه ساخته شده بعد از اتمام عملیات"
      />
      <FormActions>
        <Button onClick={() => setIsLoading(true)}>تایید</Button>
        <Button onClick={() => closePopup()}>انصراف</Button>
      </FormActions>
      <Act<{ data: { data: IInsurance } }>
        path={isLoading ? `${API}/auto/insurance` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          if (result && proceed)
            push(adminPath(`/insurance/${result.data.data._id}`));
          closePopup();
        }}
        payload={{
          name: node.name,
        }}
      />
    </PopupCard>
  );
};

export default CreateInsuranceFromRequestPopup;
