import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardAlt.module.css";
import HostedImage from "./HostedImage";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "./Ixon";
import StarIcon from "../Icons/StarIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import useComplexLocale from "../Hooks/useComplexLocale";
import VerifyIcon from "../Icons/VerifyIcon";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsMedium,
  txsRegular,
} from "./Typography";
import { WithStyleProps } from "../Layout/Layout";
import useScopedLocale from "../Hooks/useScopedLocale";
import Badge from "./Badge";
import AiIcon from "../Icons/AiIcon";
import VideoIcon from "../Icons/VideoIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import LocationIcon from "../Icons/LocationIcon";
import VerifiedImage from "./VerifiedImage";

const DoctorCardAlt = ({
  node,
  className = "",
  style,
}: WithStyleProps<{
  node: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    TextChatSettings: Record<never, never>;
    SipCallSettings: Record<never, never>;
    InPersonSettings: Record<never, never>;
    VideoCallSettings: Record<never, never>;
    VoiceCallSettings: Record<never, never>;
    Province: Record<never, never>;
  }>;
}>) => {
  const getCompContent = useComplexLocale();
  const getContent = useScopedLocale(["common"]);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.scores}>
        <div className={`${classes.badge} ${classes.starBadge}`}>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
          {
            //TODO : claculate this
          }
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>4.5</span>
        </div>
        <div className={`${classes.badge} ${classes.recommendBadge}`}>
          <Ixon width=".75rem">
            <CheckCircleIcon />
          </Ixon>
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>
            {getCompContent("xPeopleRecommended", ["20"])}
          </span>
        </div>
      </div>
      <VerifiedImage
        style={{ marginInline: "auto", marginBottom: ".5rem" }}
        src={node.avatar}
        alt={getDoctorProfileLabel(node)}
      >
        <span className={classes.onlineBadge} />
      </VerifiedImage>
      <div className={classes.identity}>
        <h5 className={`${classes.doctorName} ${tsmDemiBold}`}>
          {getDoctorProfileLabel(node)}
        </h5>
        <legend className={`${classes.speciality} ${txsRegular}`}>
          &nbsp;{node.mainSpeciality?.name}&nbsp;
        </legend>
      </div>
      <div className={classes.consult}>
        {/* <div className={`${classes.pair} ${t2xsRegular}`}>
          <span className={classes.pairTitle}>{getContent("consultTime")}</span>
          <span className={classes.pairValue}>
            {getCompContent("xMinutes", ["15"])}
          </span>
        </div>
        <div className={`${classes.pair} ${t2xsRegular}`}>
          <span className={classes.pairTitle}>
            {getContent("responseStatus")}
          </span>
          <span className={classes.pairValue}>
            {getContent("readyToRespond")}
          </span>
        </div> */}
        <div className={classes.settings}>
          <div className={classes.settingsRow}>
            <legend className={`${classes.settingsTitle} ${t2xsRegular}`}>
              {getContent("onlineConsult")}
            </legend>
            <div className={classes.settingsBadges}>
              <Badge
                leadIcon={<VideoIcon />}
                size="S"
                color={
                  node.videoCallSettings?.active ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              />
              <Badge
                leadIcon={<MicrophoneIcon />}
                size="S"
                color={
                  node.voiceCallSettings?.active ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              />
              <Badge
                leadIcon={<ChatBubbleIcon />}
                size="S"
                color={
                  node.videoCallSettings?.active ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              />
            </div>
          </div>
          <div className={classes.settingsRow}>
            <legend className={`${classes.settingsTitle} ${t2xsRegular}`}>
              <Ixon width="1rem">
                <LocationIcon />
              </Ixon>
              <span>{node.province?.name || getContent("location")}</span>
            </legend>
            <div className={classes.settingsBadges}>
              <Badge
                size="S"
                color={
                  node.videoCallSettings?.active ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              >
                {getContent("inPerson")}
              </Badge>
              <Badge
                size="S"
                color={
                  node.videoCallSettings?.active ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              >
                {getContent("sipCall")}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className={`${classes.actions} ${txsMedium}`}>
        <Link
          className={`${classes.action} ${classes.primaryAction}`}
          href={`/dr/${node.slug || node._id}`}
        >
          {getContent("visitProfile")}
        </Link>
        <Link
          className={`${classes.action} ${classes.secondaryAction}`}
          href={`/book/finalize/${node._id}`}
        >
          <span>{getContent("booking")}</span>
          <Ixon width="1.25rem">
            <ArrowLeftIcon />
          </Ixon>
        </Link>
      </div>
    </div>
  );
};

export default DoctorCardAlt;
