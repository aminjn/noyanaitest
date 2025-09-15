import { IBecomePharmacyRequest } from "@/Components/PharmacyPanel/BecomePharmacyPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const ChangeBecomePharmacyRequestStatusPopup = ({
  mutate,
  node,
}: {
  node: IBecomePharmacyRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
          status: {
            title: "وضعیت",
            type: "select",
            options: becomeNodeStatusesDict,
          },
        }}
        hookProps={{
          path: `${API}/auto/becomepharmacy/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default ChangeBecomePharmacyRequestStatusPopup;
