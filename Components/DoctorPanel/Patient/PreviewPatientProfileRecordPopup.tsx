import PopupCard from "@/Components/UI/PopupCard";
import { IPatientProfileRecord } from "./PatientFiles";
import classes from "./PreviewPatientProfileRecordPopup.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import IconLink from "@/Components/Admin/UI/IconLink";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import FormatDate from "@/Components/UI/FormatDate";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPatient"];
const PreviewPatientProfileRecordPopup = ({
  node,
}: {
  node: IPatientProfileRecord<{
    File: Record<never, never>;
    Author: Record<never, never>;
  }>;
}) => {
  console.log(node);

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <PopupCard>
      <div className={classes.main}>
        <p className={classes.title}>{node.title}</p>
        {node.description && (
          <p className={classes.description}>{node.description}</p>
        )}
        {node.files?.length && (
          <div className={classes.filesBox}>
            <legend className={classes.filesTitle}>
              {getContent("attachments")}
            </legend>
            <div className={classes.files}>
              {node.files.map((file, i) => (
                <div className={classes.file} key={file._id}>
                  <span>{`#${i}`}</span>
                  <InlineLink
                    href={`/api/v1/notpublic/${file._id}`}
                    target="_blank"
                  >
                    {getContent("view")}
                  </InlineLink>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={classes.footer}>
          <span>{getDoctorProfileLabel(node.author)}</span>
          <FormatDate className={classes.date} value={node.createdAt} />
        </div>
      </div>
    </PopupCard>
  );
};

export default PreviewPatientProfileRecordPopup;
