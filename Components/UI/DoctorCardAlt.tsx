import { ReactNode } from "react";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardAlt.module.css";
import HostedImage from "./HostedImage";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "./Ixon";
import StarIcon from "../Icons/StarIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import VerifyIcon from "../Icons/VerifyIcon";
import Link from "@/Components/i18n/Link";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsMedium,
  txsRegular,
} from "./Typography";
import { WithStyleProps } from "../Layout/Layout";
import Badge from "./Badge";
import AiIcon from "../Icons/AiIcon";
import VideoIcon from "../Icons/VideoIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import LocationIcon from "../Icons/LocationIcon";
import VerifiedImage from "./VerifiedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import FirstSlotButton, { nextSlotOf } from "../Booking/Flow/FirstSlotButton";

const LOCALE_NS: ContentNamespace[] = ["common", "uiDoctorCard"];

// The ONE doctor card of the site (2026-09): the homepage design, used on
// every page that shows a doctor. `variant="row"` is its compact form for
// lists inside other pages (clinic/hospital doctors, speciality sliders, the
// map); `bookable={false}` is a doctor without online booking (the legacy
// directory), shown with the same card but no "book" action - the
// Paziresh24 / Doctolib pattern for unclaimed profiles.
const DoctorCardAlt = ({
  node,
  className = "",
  style,
  variant = "grid",
  href,
  bookable,
  footer,
}: WithStyleProps<{
  // page-specific extra under the card body (e.g. the free-slots strip on
  // the booking search) - the card itself stays the same everywhere
  footer?: ReactNode;
  variant?: "grid" | "row";
  // profile link; defaults to the bookable profile page /dr/<slug>
  href?: string;
  bookable?: boolean;
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
  // The booking action follows what the server computed for every card
  // (backend Lib/doctorOffer.ts `bookable`): a claimed, published doctor
  // who offers at least one visit type a patient can book. An unclaimed
  // directory profile, or a doctor with no office / hours / visit type yet,
  // is shown with the same card, without a "book" button that led nowhere.
  const flags = node as { claimed?: boolean; bookable?: boolean; mcCode?: unknown; medicalSystemCode?: string };
  const canBook =
    bookable ?? (typeof flags.bookable === "boolean" ? flags.bookable : flags.claimed !== false);
  // the tick: a doctor with an account whose council code is on record
  // (checked by the inquiry or by the staff who approved them) - the same
  // rule as the profile page
  const verified = flags.claimed !== false && !!(flags.mcCode || flags.medicalSystemCode);
  const getCompContent = useScopedLocale(LOCALE_NS);
  const getContent = useScopedLocale(LOCALE_NS);
  const profileHref = href || `/dr/${node.slug || node._id}`;
  // A visit type is "on" when the doctor offers it: the search API sends the
  // real list (active setting AND a shift that covers it) as sessionTypes;
  // elsewhere the per-type settings' active flag is used.
  const apiTypes = (node as { sessionTypes?: unknown }).sessionTypes;
  const offers = (
    type: "textChat" | "sipCall" | "voiceCall" | "videoCall" | "inPerson",
  ) =>
    Array.isArray(apiTypes)
      ? apiTypes.includes(type)
      : !!node[`${type}Settings`]?.active;
  const score = node.averageScore ? node.averageScore.toFixed(1) : "0";
  // «اولین نوبت» from the list endpoints (backend Lib/nextSlot.ts)
  // (null from an endpoint that computed it: nothing free in the horizon;
  // absent: not computed there, so nothing is claimed)
  const firstSlot = canBook ? nextSlotOf(node) : null;
  const computed = (node as { nextSlot?: unknown }).nextSlot !== undefined;
  const first = canBook && (firstSlot || computed) ? <FirstSlotButton node={node as never} slot={firstSlot} /> : null;

  if (variant === "row")
    return (
      <div className={`${classes.rowBox} ${className}`} style={style}>
        <div className={classes.row}>
          <Link href={profileHref} className={classes.rowMain}>
            <VerifiedImage
              src={node.avatar}
              alt={getDoctorProfileLabel(node)}
              verified={verified}
              style={{ width: "3rem", height: "3rem" }}
            />
            <span className={classes.rowText}>
              <span className={`${classes.doctorName} ${tsmDemiBold}`}>
                {getDoctorProfileLabel(node)}
              </span>
              {!!node.mainSpeciality?.name && (
                <span className={`${classes.speciality} ${txsRegular}`}>
                  {node.mainSpeciality.name}
                </span>
              )}
              <span className={`${classes.rowMeta} ${t2xsRegular}`}>
                <Ixon width=".75rem" className={classes.rowStar}>
                  <StarIcon />
                </Ixon>
                {score}
                {!!node.feedbackCount && (
                  <span>{`(${getContent("nComments", [String(node.feedbackCount)])})`}</span>
                )}
              </span>
            </span>
          </Link>
          {canBook ? (
            <Link
              className={`${classes.action} ${classes.secondaryAction} ${txsMedium}`}
              href={`/book/finalize/${node._id}`}
            >
              {getContent("booking")}
            </Link>
          ) : (
            <span className={`${classes.rowNote} ${t2xsRegular}`}>
              {getContent("noOnlineBooking")}
            </span>
          )}
        </div>
        {first}
        {footer}
      </div>
    );

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.scores}>
        <div className={`${classes.badge} ${classes.starBadge}`}>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>{score}</span>
        </div>
        <div className={`${classes.badge} ${classes.recommendBadge}`}>
          <Ixon width=".75rem">
            <CheckCircleIcon />
          </Ixon>
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>
            {getCompContent("xPeopleRecommended", [
              String(node.recommendCount || 0),
            ])}
          </span>
        </div>
      </div>
      <VerifiedImage
        style={{ marginInline: "auto", marginBottom: ".5rem" }}
        src={node.avatar}
        alt={getDoctorProfileLabel(node)}
        verified={verified}
      />
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
                  offers("videoCall") ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              />
              <Badge
                leadIcon={<MicrophoneIcon />}
                size="S"
                color={
                  offers("voiceCall") ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              />
              <Badge
                leadIcon={<ChatBubbleIcon />}
                size="S"
                color={
                  offers("textChat") ? "Primarylight" : "Disabled"
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
                  offers("inPerson") ? "Primarylight" : "Disabled"
                }
                mode="Fill"
                radius="High"
              >
                {getContent("inPerson")}
              </Badge>
              <Badge
                size="S"
                color={
                  offers("sipCall") ? "Primarylight" : "Disabled"
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
      {first}
      {footer}
      <div className={`${classes.actions} ${txsMedium}`}>
        <Link
          className={`${classes.action} ${classes.primaryAction}`}
          href={profileHref}
        >
          {getContent("visitProfile")}
        </Link>
        {canBook ? (
          <Link
            className={`${classes.action} ${classes.secondaryAction}`}
            href={`/book/finalize/${node._id}`}
          >
            <span>{getContent("booking")}</span>
            <Ixon width="1.25rem">
              <ArrowLeftIcon />
            </Ixon>
          </Link>
        ) : (
          <span className={`${classes.action} ${classes.disabledAction}`}>
            {getContent("noOnlineBooking")}
          </span>
        )}
      </div>
    </div>
  );
};

export default DoctorCardAlt;
