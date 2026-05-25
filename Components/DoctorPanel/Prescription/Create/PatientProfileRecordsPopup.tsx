import Ixon from "@/Components/UI/Ixon";
import { PrescriptionPatientProfile } from "./PatientProfileOverviewPopup";
import classes from "./PatientProfileRecordsPopup.module.css";
import CloseIcon from "@/Components/Icons/CloseIcon";
import useLocale from "@/Components/Hooks/useLocale";
import PatientPersonalDetailsPopupTitle from "./PatientPersonalDetailsPopupTitle";
import { PrescriptionCtx } from "../PrescriptionContext";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { useMemo, useState } from "react";
import SearchIcon from "@/Components/Icons/SearchIcon";
import Button from "@/Components/UI/Button";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import usePopup from "@/Components/Hooks/usePopup";
import PrescriptionCreatePatientProfilePopup from "./PrescriptionCreatePatientprofileRecordPopup";
import UserEditIcon from "@/Components/Icons/UserEditIcon";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { dateToString } from "@/Components/UI/FormatDate";
import PatientProfileRecordPreviewPopup from "./PatientProfileRecordPreviewPopup";
import ChevronIcon from "@/Components/Icons/ChevronIcon";

const PatientProfileRecordsPopup = ({
  profile,
  ctx,
}: {
  profile: PrescriptionPatientProfile;
  ctx: PrescriptionCtx;
}) => {
  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  const [query, setQuery] = useState<string>("");

  const { setPopup, closePopup } = usePopup();

  const filtered = useMemo<PrescriptionPatientProfile["records"]>(
    () => profile.records.filter((rec) => rec.title.includes(query)),
    [profile.records, query],
  );

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          className={classes.close}
          onClick={() => closePopup("PatientProfileRecords")}
        >
          <Ixon width="1.5rem">
            <CloseIcon />
          </Ixon>
        </button>
        <span className={classes.title}>
          {getCompContent("patinetProfileXHistory", [profile.title])}
        </span>
        <PatientPersonalDetailsPopupTitle ctx={ctx} />
      </div>
      <div className={classes.actions}>
        <div className={classes.searchBox}>
          <Ixon className={classes.searchIcon} width="1.5rem">
            <SearchIcon />
          </Ixon>
          <input
            className={classes.searchInput}
            placeholder={getContent("searchPlaceholder")}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className={classes.badge}>{filtered.length}</span>
        <Button
          tailIcon={<EditAltIcon />}
          onClick={() =>
            setPopup(
              "PrescriptionCreatePatientProfile",
              <PrescriptionCreatePatientProfilePopup />,
            )
          }
        >
          {getContent("newPatientProfileRecord")}
        </Button>
      </div>
      <div className={classes.list}>
        {filtered.map((record) => (
          <div key={record._id} className={classes.record}>
            <span className={classes.point} />
            <span className={classes.recordTitle}>{record.title}</span>
            <div className={classes.recordAuthor}>
              <Ixon width="1.5rem" className={classes.authorIcon}>
                <UserEditIcon />
              </Ixon>
              <span>{getDoctorProfileLabel(record.author)}</span>
            </div>
            <span className={classes.creation}>
              {getCompContent("createdAtX", [
                dateToString({ value: record.createdAt, time: false }),
              ])}
            </span>
            <button
              className={classes.chevron}
              type="button"
              onClick={() =>
                setPopup(
                  "PatientProfileRecordPreview",
                  <PatientProfileRecordPreviewPopup
                    record={record}
                    ctx={ctx}
                  />,
                )
              }
            >
              <Ixon width="1.125rem">
                <ChevronIcon />
              </Ixon>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientProfileRecordsPopup;
