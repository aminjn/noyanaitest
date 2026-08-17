import classes from "./ScheduleBookingCard.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import Ixon from "@/Components/UI/Ixon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import UserIcon from "@/Components/Icons/UserIcon";
import MobileIcon from "@/Components/Icons/MobileIcon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { IScheduleBooking } from "./DoctorManageSchedulePage";

const ScheduleBookingCard = ({ node }: { node: IScheduleBooking }) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <span className={classes.time}>
          <Ixon width="1rem">
            <ClockIcon />
          </Ixon>
          <span>
            {numberToTime(node.session.start)} - {numberToTime(node.session.end)}
          </span>
        </span>
        <IconLink
          href={`/doctorpanel/calendar/${new Date(node.session.date).getTime()}`}
          title={getContent("view")}
        >
          <EyeIcon />
        </IconLink>
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
          <span>{getContent(node.kind)}</span>
        </span>
        {!!node.session.clinic?.name && (
          <span className={classes.metaItem}>
            <Ixon width="1rem">
              <BuildingIcon />
            </Ixon>
            <span>{node.session.clinic.name}</span>
          </span>
        )}
        <span className={classes.metaItem}>
          <Ixon width="1rem">
            <WalletIcon />
          </Ixon>
          <span>{currencize(node.bookPrice || 0)}</span>
        </span>
      </div>
      {!!node.message && <p className={classes.message}>{node.message}</p>}
      <div className={classes.footer}>
        <span>{getContent("bookedAt")}</span>
        <FormatDate value={node.bookedAt} />
      </div>
    </div>
  );
};

export default ScheduleBookingCard;
