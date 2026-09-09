import {
  additionRequestStatusDict,
  IHospitalAdditionRequest,
} from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import classes from "./MutateHospitalRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const MutateHospitalRequestPopup = ({
  mutate,
  node,
}: {
  node: IHospitalAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <Box className={classes.main}>
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
            title: "وضعیت",
            options: additionRequestStatusDict,
          },
        }}
      />
    </Box>
  );
};

export default MutateHospitalRequestPopup;
