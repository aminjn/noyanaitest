import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./ProfileRenderer.module.css";
import Ixon from "@/Components/UI/Ixon";
import FolderIcon from "@/Components/Icons/FolderIcon";
import { useContext } from "react";
import PrescriptionContext from "../PrescriptionContext";
import FormatDate, { dateToString } from "@/Components/UI/FormatDate";
import IconButton from "@/Components/Admin/UI/IconButton";
import LinkAltIcon from "@/Components/Icons/LinkAltIcon";
import FileIcon from "@/Components/Icons/FileIcon";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const ProfileRenderer = () => {
  const ctx = useContext(PrescriptionContext);
  const getContent = useScopedLocale(LOCALE_NS);

  const getCompContent = useScopedLocale(LOCALE_NS);

  const { profile, setProfile } = ctx;

  if (!profile) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        {getContent("connectedToPatientProfile")}
      </div>
      <div className={classes.details}>
        <div className={classes.titleBox}>
          <Ixon width="1.25rem">
            <FolderIcon />
          </Ixon>
          <span>{profile.title}</span>
        </div>
        <div className={classes.side}>
          <span
            className={classes.creation}
            style={{ marginInlineEnd: "1rem" }}
          >
            {getCompContent("createdAtX", [
              dateToString({ value: profile.createdAt }),
            ])}
          </span>
          <IconButton
            style={{ marginInlineEnd: ".5rem" }}
            variant="Info"
            onClick={() => setProfile(null)}
            title={getContent("unlinkThisPatientProfile")}
          >
            <LinkAltIcon />
          </IconButton>
          <IconButton
            variant="Danger"
            title={getContent("seeThisPatientProfileDetails")}
          >
            <FileIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ProfileRenderer;
