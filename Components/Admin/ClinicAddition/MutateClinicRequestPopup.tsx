import {
  additionRequestStatusDict,
  IClinicAdditionRequest,
} from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import classes from "./MutateClinicRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const MutateClinicRequestPopup = ({
  mutate,
  node,
}: {
  node: IClinicAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <Box className={classes.main}>
      <CreateForm<IClinicAdditionRequest>
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/clinicaddition/${node._id}`,
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

export default MutateClinicRequestPopup;
