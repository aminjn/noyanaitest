import classes from "./ScheduleReservationCard.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Ixon from "@/Components/UI/Ixon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import UserIcon from "@/Components/Icons/UserIcon";
import MobileIcon from "@/Components/Icons/MobileIcon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import FormatDate from "@/Components/UI/FormatDate";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { IScheduleReservation } from "./DoctorManageSchedulePage";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

// System B counterpart of ScheduleBookingCard, added per F-01's
// getMySchedule merge - see AUDIT/FIXES_TODO.md F-01.
const ScheduleReservationCard = ({ node }: { node: IScheduleReservation }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <span className={classes.time}>
          <Ixon width="1rem">
            <ClockIcon />
          </Ixon>
          <span>
            {numberToTime(node.start)} - {numberToTime(node.end)}
          </span>
        </span>
        <div className={classes.headerActions}>
          <ReservationStatusBadge status={node.status} />
          <IconLink
            href={`/doctorpanel/booking/${node._id}`}
            title={getContent("view")}
          >
            <EyeIcon />
          </IconLink>
        </div>
      </div>
      <div className={classes.patient}>
        <Ixon width="1.25rem">
          <UserIcon />
        </Ixon>
        <span className={classes.patientName}>
          {node.patient.givenName} {node.patient.lastName}
        </span>
      </div>
      <div className={classes.meta}>
        <span className={classes.metaItem}>
          <Ixon width="1rem">
            <MobileIcon />
          </Ixon>
          <span>{node.user.phone}</span>
        </span>
        <span className={classes.metaItem}>
          <Ixon width="1rem">
            <StetoscopeIcon />
          </Ixon>
          <span>{getContent(node.sessionType)}</span>
        </span>
        {!!node.office?.name && (
          <span className={classes.metaItem}>
            <Ixon width="1rem">
              <BuildingIcon />
            </Ixon>
            <span>{node.office.name}</span>
          </span>
        )}
      </div>
      <div className={classes.footer}>
        <span>{getContent("submittedAt")}</span>
        <FormatDate value={node.createdAt} />
      </div>
    </div>
  );
};

export default ScheduleReservationCard;
