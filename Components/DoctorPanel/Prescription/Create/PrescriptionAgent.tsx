import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
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

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const Inner = () => {
  const getContent = useScopedLocale(LOCALE_NS);

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
