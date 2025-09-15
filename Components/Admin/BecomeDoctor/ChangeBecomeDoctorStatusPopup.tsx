import {
  becomeNodeStatusesDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./ChangeBecomeDoctorStatusPopup.module.css";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import Box from "../UI/Box";

const ChangeBecomeDoctorStatusPopup = ({
  mutate,
  node,
}: {
  node: IBecomeDoctorRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <Box>
      <CreateForm
        styleManaged
        defaultValue={node}
        renderer={{
          status: {
            type: "select",
            title: "وضعیت",
            options: becomeNodeStatusesDict,
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
    </Box>
  );
};

export default ChangeBecomeDoctorStatusPopup;
