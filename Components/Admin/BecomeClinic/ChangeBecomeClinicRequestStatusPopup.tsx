import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const ChangeBecomeClinicRequestPopup = ({
  mutate,
  node,
}: {
  node: IBecomeClinicRequest;
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
            options: becomeNodeStatusesDict,
            title: "وضعیت",
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/becomeclinic/${node._id}`,
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

export default ChangeBecomeClinicRequestPopup;
