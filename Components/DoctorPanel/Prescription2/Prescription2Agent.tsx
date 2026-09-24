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

  console.log(
    JSON.parse(
      '{"patient":"0018243460","prescType":{"prescTypeId":7},"prescDate":"14050201","docId":"0000000012","docMobileNo":"09198697377","docNationalCode":"0451253541","comments":"","expireDate":"14030719","clientId":"1234567891","noteDetailEprscs":[],"noteDetailsReferralList":[{"docSpecReferred":{"specCode":"00181"},"icd10s":[{"icdId":"X46.43"}],"complaints":[{"id":"163588007"}],"message":"تست","referralHijriDate":"14050216","quantity":2}]}',
    ),
  );

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
