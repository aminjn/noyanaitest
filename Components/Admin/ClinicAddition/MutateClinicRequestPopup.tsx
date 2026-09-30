import PopupCard from "@/Components/UI/PopupCard";
import {
  additionRequestStatusDict,
  IClinicAdditionRequest,
} from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateClinicRequestPopup = ({
  mutate,
  node,
}: {
  node: IClinicAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("درخواست افزودن کلینیک")}>
      <CreateForm<IClinicAdditionRequest>
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/clinicaddition/${node._id}`,
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

export default MutateClinicRequestPopup;
