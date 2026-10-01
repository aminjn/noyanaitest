import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePrescription from "./Store/usePrescription";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import CreatePrescriptionPatient from "./UI/CreatePrescriptionPatient";
import PrescriptionItemGetter from "./UI/PrescriptionItemGetter";
import CreatePrescriptionItemPreview from "./UI/CreatePrescriptionItemPreview";
import CreatePrescriptionActions from "./UI/CreatePrescriptionActions";
import CreatePrescriptionTaminBox from "./UI/CreatePrescriptionTaminBox";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionCreate"];

const Prescription2Agent = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { working } = usePrescription();


  return (
    <WithTitle
      title={getContent("createNewPrescription")}
      //   actions={[
      //     {
      //       title: getContent("addPatient"),
      //       action: () => setPopup("CreatePatient", <CreatePatientPopup />),
      //     },
      //   ]}
    >
      <CreatePrescriptionTaminBox />
      <CreatePrescriptionPatient />
      <PrescriptionItemGetter key={working._id} />
      <CreatePrescriptionItemPreview />
      <CreatePrescriptionActions />
    </WithTitle>
  );
};

export default Prescription2Agent;
