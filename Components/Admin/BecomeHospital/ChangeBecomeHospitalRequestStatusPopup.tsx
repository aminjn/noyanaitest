import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeManualStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const ChangeBecomeHospitalRequestPopup = ({
  mutate,
  node,
}: {
  node: IBecomeHospitalRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
          status: {
            type: "select",
            options: becomeNodeManualStatusesDict,
            title: ta("وضعیت"),
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/becomehospital/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default ChangeBecomeHospitalRequestPopup;
