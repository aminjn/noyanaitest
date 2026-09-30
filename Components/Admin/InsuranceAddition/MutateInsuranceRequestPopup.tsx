import PopupCard from "@/Components/UI/PopupCard";
import { IInsuranceAdditionRequest } from "@/Components/DoctorPanel/Insurance/DoctorInsuranceAdditionRequestsTab";
import { additionRequestStatusDict } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateInsuranceRequestPopup = ({
  mutate,
  node,
}: {
  node: IInsuranceAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("درخواست افزودن بیمه")}>
      <CreateForm<IInsuranceAdditionRequest>
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/insuranceaddition/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          status: {
            type: "select",
            title: ta("وضعیت"),
            options: additionRequestStatusDict,
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateInsuranceRequestPopup;
