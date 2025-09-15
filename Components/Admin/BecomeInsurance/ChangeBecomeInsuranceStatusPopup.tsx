import usePopup from "@/Components/Hooks/usePopup";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";

const ChangeBecomeInsuranceStatusPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IBecomeInsuranceRequest;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
          status: {
            type: "select",
            title: "وضعیت",
            options: becomeNodeStatusesDict,
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/becomeinsurance/${node._id}`,
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

export default ChangeBecomeInsuranceStatusPopup;
