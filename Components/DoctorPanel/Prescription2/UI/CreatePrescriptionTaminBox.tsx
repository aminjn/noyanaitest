import useLocale from "@/Components/Hooks/useLocale";
import usePrescription from "../Store/usePrescription";
import classes from "./CreatePrescriptionTaminBox.module.css";
import { ContentKey } from "@/Components/Enums/contentKeys";

const Segment = ({ title, value }: { title: ContentKey; value?: string }) => {
  const getContent = useLocale();
  return (
    <div className={classes.segment}>
      <span className={classes.segmentTitle}>{getContent(title)}</span>
      <span>:</span>
      <span className={classes.segmentValue}>
        {value || getContent("notAssigned")}
      </span>
    </div>
  );
};

const CreatePrescriptionTaminBox = () => {
  const { defaultValue } = usePrescription();

  const getContent = useLocale();

  console.log(defaultValue);

  if (!defaultValue?.taminPrescriptions.length) return null;
  return (
    <div className={classes.main}>
      <p className={classes.title}>
        {getContent("committedTaminPrescriptions")}
      </p>
      <div className={classes.list}>
        {defaultValue.taminPrescriptions.map((node) => (
          <div key={node._id} className={classes.item}>
            <Segment
              title={"prescriptionType"}
              value={node.prescType.prescTypeDesc}
            />
            <Segment title={"taminPrescriptionId"} value={node.taminId} />
            <Segment
              title={"taminPrescriptionTracking"}
              value={node.tracking}
            />
            <Segment title="serviceType" value={node.serviceType.srvTypeDes} />
          </div>
        ))}
      </div>
    </div>
  );
};

// 140029251
// 27042

export default CreatePrescriptionTaminBox;
