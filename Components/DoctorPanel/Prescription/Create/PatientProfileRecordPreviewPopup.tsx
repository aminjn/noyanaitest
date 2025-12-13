import useLocale from "@/Components/Hooks/useLocale";
import { PrescriptionCtx } from "../PrescriptionContext";
import PatientPersonalDetailsPopupTitle from "./PatientPersonalDetailsPopupTitle";
import { PrescriptionPatientProfile } from "./PatientProfileOverviewPopup";
import classes from "./PatientProfileRecordPreviewPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import ArrowTurnRightIcon from "@/Components/Icons/ArrowTurnRightIcon";
import PrescriptionCreatePatientProfilePopup from "./PrescriptionCreatePatientprofileRecordPopup";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { dateToString } from "@/Components/UI/FormatDate";
import Ixon from "@/Components/UI/Ixon";
import UserEditIcon from "@/Components/Icons/UserEditIcon";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import AreaInput from "@/Components/UI/AreaInput";
import LinkAltIcon from "@/Components/Icons/LinkAltIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";

const PatientProfileRecordPreviewPopup = ({
  record,
  ctx,
}: {
  record: PrescriptionPatientProfile["records"][number];
  ctx: PrescriptionCtx;
}) => {
  const getContent = useLocale();

  const { setPopup, closePopup } = usePopup();

  const getCompContent = useComplexLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          type="button"
          className={classes.close}
          onClick={() => closePopup("PatientProfileRecordPreview")}
        >
          <Ixon width="1.5rem">
            <CloseIcon />
          </Ixon>
        </button>
        <span className={classes.title}>
          {getCompContent("xPatientProfileRecordDetails", [record.title])}
        </span>
        <PatientPersonalDetailsPopupTitle ctx={ctx} />
      </div>
      <div className={classes.actions}>
        <Button
          variant="Primary3"
          tailIcon={<EditAltIcon />}
          onClick={() =>
            setPopup(
              "PrescriptionCreatePatientProfile",
              <PrescriptionCreatePatientProfilePopup />
            )
          }
        >
          {getContent("newPatientProfileRecord")}
        </Button>
        <Button
          variant="Secondary3"
          tailIcon={<ArrowTurnRightIcon />}
          onClick={() => closePopup("PatientProfileRecordPreview")}
        >
          {getContent("back")}
        </Button>
      </div>
      <div className={classes.overview}>
        <span className={classes.point} />
        <span className={classes.recordTitle}>{record.title}</span>
        <span className={classes.creation}>
          {getCompContent("createdAtX", [
            dateToString({ value: record.createdAt }),
          ])}
        </span>
      </div>
      <div className={classes.content}>
        <div className={classes.author}>
          <Ixon width="1rem" style={{ marginInlineEnd: ".5rem" }}>
            <UserEditIcon />
          </Ixon>
          <span className={classes.createdBy}>{getContent("createdBy")}</span>
          <span className={classes.authorName}>
            {getDoctorProfileLabel(record.author)}
          </span>
          {!!record.author.mainSpeciality && (
            <span className={classes.speciality}>
              {record.author.mainSpeciality.name}
            </span>
          )}
        </div>
        <AreaInput
          readOnly
          title={getContent("description")}
          defaultValue={record.description}
        />
        <div className={classes.middle}>
          <AreaInput
            readOnly
            title={getContent("patientSymptoms")}
            defaultValue={record.symptoms.map((el) => el.name).join(",")}
          />
        </div>
        <div className={classes.files}>
          {record.files.map((file) => (
            <div key={file._id} className={classes.file}>
              <Ixon width="1rem" className={classes.fileIcon}>
                <LinkAltIcon />
              </Ixon>
              <span className={classes.fileName}>{file.file}</span>
              <button type="button" className={classes.fileBtn}>
                <span>{getContent("seeAttachment")}</span>
                <Ixon width="1rem">
                  <EyeIcon />
                </Ixon>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientProfileRecordPreviewPopup;
