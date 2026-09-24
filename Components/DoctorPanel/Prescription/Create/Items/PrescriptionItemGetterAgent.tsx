import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "./PrescriptionItemGetterAgent.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import DrugAgent from "./DrugAgent";
import PillIcon from "@/Components/Icons/PillIcon";
import LabAgent from "./LabAgent";
import FlaskIcon from "@/Components/Icons/FlaskIcon";
import ImagingAgent from "./ImagingAgent";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import PhysioAgent from "./PhysioAgent";
import BandageIcon from "@/Components/Icons/BandageIcon";
import MedicalReportIcon from "@/Components/Icons/MedicalReportIcon";
import ServicesAgent from "./ServicesAgent";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const PrescriptionItemGetterAgent = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <div className={classes.main}>
      <ClientTabSystem
        items={[
          {
            id: "Drug",
            title: getContent("drug"),
            content: <DrugAgent />,
            icon: <PillIcon />,
          },
          {
            id: "Lab",
            title: getContent("test"),
            content: <LabAgent />,
            icon: <FlaskIcon />,
          },
          {
            id: "Imaing",
            content: <ImagingAgent />,
            title: getContent("imaging"),
            icon: <MedicalRecordIcon />,
          },
          {
            id: "Physio",
            title: getContent("physiotherpy"),
            content: <PhysioAgent />,
            icon: <BandageIcon />,
          },
          {
            id: "Services",
            title: getContent("otherParaclinicServices"),
            icon: <MedicalReportIcon />,
            content: <ServicesAgent />,
          },
        ]}
      />
    </div>
  );
};

export default PrescriptionItemGetterAgent;
