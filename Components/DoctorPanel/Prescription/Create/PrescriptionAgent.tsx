import useLocale from "@/Components/Hooks/useLocale";
import { useContext } from "react";
import PrescriptionContext, {
  DefaultPrescription,
  PrescriptionContextProvider,
} from "../PrescriptionContext";
import usePopup from "@/Components/Hooks/usePopup";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import CreatePatientPopup from "./CreatePatientPopup";
import PrescriptionPatientManager from "./PrescriptionPatientManager";
import PrescriptionItemGetterAgent from "./Items/PrescriptionItemGetterAgent";
import PrescriptionItemsOverview from "./PrescriptionItemsOverview";

const Inner = () => {
  const getContent = useLocale();

  useContext(PrescriptionContext);

  const { setPopup } = usePopup();
  return (
    <WithTitle
      title={getContent("createNewPrescription")}
      actions={[
        {
          title: getContent("addPatient"),
          action: () => setPopup("CreatePatient", <CreatePatientPopup />),
        },
      ]}
    >
      <PrescriptionPatientManager />
      <PrescriptionItemGetterAgent />
      <PrescriptionItemsOverview />
    </WithTitle>
  );
};

const PrescriptionAgent = ({
  defaultValue,
}: {
  defaultValue?: DefaultPrescription;
}) => {
  return (
    <PrescriptionContextProvider defaultValue={defaultValue}>
      <Inner />
    </PrescriptionContextProvider>
  );
};

export default PrescriptionAgent;
