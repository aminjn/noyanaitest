import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeManualStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const ChangeBecomeParaClinicRequestStatusPopup = ({
  mutate,
  node,
}: {
  node: IBecomeParaClinicRequest;
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
            title: "وضعیت",
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/becomeParaClinic/${node._id}`,
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

export default ChangeBecomeParaClinicRequestStatusPopup;
