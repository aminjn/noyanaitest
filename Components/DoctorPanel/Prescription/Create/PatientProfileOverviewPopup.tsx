import { PrescriptionCtx } from "../PrescriptionContext";
import classes from "./PatientProfileOverviewPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Ixon from "@/Components/UI/Ixon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import PatientPersonalDetailsPopupTitle from "./PatientPersonalDetailsPopupTitle";
import { IPatientProfile } from "../../Patient/PatientFiles";
import FolderIcon from "@/Components/Icons/FolderIcon";
import { dateToString } from "@/Components/UI/FormatDate";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Loading from "@/Components/Admin/UI/Loading";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import UserEditIcon from "@/Components/Icons/UserEditIcon";
import VerticalDivider from "@/Components/UI/VerticalDivider";
import AreaInput from "@/Components/UI/AreaInput";
import PrescriptionProTip from "./PrescriptionProTip";
import { Fragment } from "react";
import PatientProfileRecordsPopup from "./PatientProfileRecordsPopup";

export type PrescriptionPatientProfile = IPatientProfile<{
  Doctor: { MainSpecialityPopulated: Record<never, never> };
  Records: {
    Author: { MainSpecialityPopulated: Record<never, never> };
    Symptoms: Record<never, never>;
    File: Record<never, never>;
  };
}>;

const PatientProfileOverviewPopup = ({
  profile,
  ctx,
}: {
  profile: IPatientProfile;
  ctx: PrescriptionCtx;
}) => {
  const { data } = useSWR<PrescriptionPatientProfile>(
    profile ? `${API}/doctor/presc/profile/${profile._id}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.profile)
  );

  const getContent = useLocale();

  const { setProfile } = ctx;
  const getCompContent = useComplexLocale();

  const { closePopup, setPopup } = usePopup();
  if (!data) return <Loading />;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          type="button"
          onClick={() => closePopup("PatientProfileOverview")}
          className={classes.close}
        >
          <Ixon width="1.5rem">
            <CloseIcon />
          </Ixon>
        </button>
        <Button
          variant="Primary3"
          onClick={() =>
            setProfile((prev) => (prev?._id === profile._id ? null : profile))
          }
          style={{ marginInlineEnd: "auto" }}
        >
          {getContent("connectToPrescription")}
        </Button>
        <PatientPersonalDetailsPopupTitle ctx={ctx} />
      </div>
      <PrescriptionProTip />
      <div className={classes.profile}>
        <div className={classes.titleBox}>
          <Ixon width="1.25rem">
            <FolderIcon />
          </Ixon>
          <span>{profile.title}</span>
        </div>
        <div className={classes.date}>
          {getCompContent("createdAtX", [
            dateToString({ value: profile.createdAt }),
          ])}
        </div>
      </div>
      <div className={classes.author}>
        <span className={classes.authorTitle}>
          <Ixon width="1.5rem">
            <UserEditIcon />
          </Ixon>
          <span>{`${getContent("createdBy")} :`}</span>
        </span>
        <span className={classes.authorName}>
          {getDoctorProfileLabel(data.doctor)}
        </span>
        {!!data.doctor.mainSpeciality && (
          <Fragment>
            <VerticalDivider />
            <span className={classes.speciality}>
              {data.doctor.mainSpeciality.name}
            </span>
          </Fragment>
        )}
        <Button
          className={classes.history}
          tailIcon={
            <span className={classes.badge}>{data.records.length}</span>
          }
          variant="Secondary3"
          onClick={() =>
            setPopup(
              "PatientProfileRecords",
              <PatientProfileRecordsPopup ctx={ctx} profile={data} />
            )
          }
        >
          {getContent("seeHistory")}
        </Button>
      </div>
      <AreaInput
        title={getContent("description")}
        readOnly
        defaultValue={data.description}
      />
    </div>
  );
};

export default PatientProfileOverviewPopup;
