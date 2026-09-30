import PopupCard from "@/Components/UI/PopupCard";
import {
  becomeNodeManualStatusesDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const ChangeBecomeDoctorStatusPopup = ({
  mutate,
  node,
}: {
  node: IBecomeDoctorRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title="تغییر وضعیت درخواست">
      <CreateForm
        styleManaged
        defaultValue={node}
        renderer={{
          status: {
            type: "select",
            title: "وضعیت",
            options: becomeNodeManualStatusesDict,
          },
        }}
        hookProps={{
          path: `${API}/auto/becomedoctor/${node._id}`,
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

export default ChangeBecomeDoctorStatusPopup;
