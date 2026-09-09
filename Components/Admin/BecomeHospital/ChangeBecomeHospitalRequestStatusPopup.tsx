import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

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
            options: becomeNodeStatusesDict,
            title: "وضعیت",
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
