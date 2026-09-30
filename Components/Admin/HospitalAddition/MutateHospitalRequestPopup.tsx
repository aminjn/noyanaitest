import PopupCard from "@/Components/UI/PopupCard";
import {
  additionRequestStatusDict,
  IHospitalAdditionRequest,
} from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateHospitalRequestPopup = ({
  mutate,
  node,
}: {
  node: IHospitalAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("درخواست افزودن بیمارستان")}>
      <CreateForm<IHospitalAdditionRequest>
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/hospitaladdition/${node._id}`,
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

export default MutateHospitalRequestPopup;
