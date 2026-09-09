import { IInsuranceAdditionRequest } from "@/Components/DoctorPanel/Insurance/DoctorInsuranceAdditionRequestsTab";
import { additionRequestStatusDict } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import classes from "./MutateInsuranceRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const MutateInsuranceRequestPopup = ({
  mutate,
  node,
}: {
  node: IInsuranceAdditionRequest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <Box className={classes.main}>
      <CreateForm<IInsuranceAdditionRequest>
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/insuranceaddition/${node._id}`,
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

export default MutateInsuranceRequestPopup;
