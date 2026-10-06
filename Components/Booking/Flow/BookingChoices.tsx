"use client";
import { ReactNode, useMemo } from "react";
import { useIntlLocale, useListSeparator } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import Ixon from "@/Components/UI/Ixon";
import VideoIcon from "@/Components/Icons/VideoIcon";
import HospitalIcon from "@/Components/Icons/HospitalIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import LandlineIcon from "@/Components/Icons/LandlineIcon";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import { visitTypeOrder } from "./bookingFlow";
import classes from "./BookingChoices.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

export const visitTypeIcon: Record<DoctorSessionType, ReactNode> = {
  inPerson: <HospitalIcon />,
  videoCall: <VideoIcon />,
  voiceCall: <CallCallingIcon />,
  sipCall: <LandlineIcon />,
  textChat: <ChatBubbleIcon />,
};
export const visitTypeTone: Record<DoctorSessionType, string> = {
  inPerson: "tone-indigo",
  videoCall: "tone-violet",
  voiceCall: "tone-teal",
  sipCall: "tone-sky",
  textChat: "tone-amber",
};
const visitTypeHint: Record<DoctorSessionType, ContentKey> = {
  inPerson: "bfHintInPerson",
  videoCall: "bfHintVideo",
  voiceCall: "bfHintVoice",
  sipCall: "bfHintSip",
  textChat: "bfHintText",
};

type TypeSettings = { active?: boolean; price?: number; hidePrice?: boolean } | null | undefined;

// The visit types the doctor offers, as big cards with their price
// (Doctolib's "motif" step, Paziresh24's in-person / online tabs).
export const VisitTypePicker = ({
  settings,
  value,
  onChange,
}: {
  settings: Partial<Record<DoctorSessionType, TypeSettings>> | undefined;
  value: DoctorSessionType | null | undefined;
  onChange: (t: DoctorSessionType) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const types = visitTypeOrder.filter((t) => settings?.[t]?.active && !!settings?.[t]?.price);
  if (!types.length) return null;
  return (
    <div className={classes.types} role="radiogroup" aria-label={getContent("bfVisitType")}>
      {types.map((t) => {
        const s = settings?.[t];
        const on = value === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            className={`${classes.type} ${on ? classes.on : ""}`}
            onClick={() => onChange(t)}
          >
            <span className={`${classes.icon} ${visitTypeTone[t]}`}>
              <Ixon width="1.25rem">{visitTypeIcon[t]}</Ixon>
            </span>
            <span className={classes.typeText}>
              <b>{getContent(doctorSessionTypeContentKeyDict[t])}</b>
              <small>{getContent(visitTypeHint[t])}</small>
            </span>
            <span className={classes.price}>
              {s?.hidePrice || !s?.price ? getContent("bfPriceOnSite") : getContent("xToman", [nf.format(s.price)])}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// the doctor's places for an in-person visit
export const OfficePicker = ({
  offices,
  value,
  onChange,
}: {
  offices: { _id: string; name?: string; address?: string }[];
  value: string | null | undefined;
  onChange: (id: string) => void;
}) => {
  const getContent = useScopedLocale(NS);
  if (offices.length < 2) return null;
  return (
    <div className={classes.offices} role="radiogroup" aria-label={getContent("bfOffice")}>
      {offices.map((o) => (
        <button
          key={o._id}
          type="button"
          role="radio"
          aria-checked={value === o._id}
          className={`${classes.office} ${value === o._id ? classes.on : ""}`}
          onClick={() => onChange(o._id)}
        >
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
          <span className={classes.typeText}>
            <b>{o.name || getContent("bfOffice")}</b>
            {!!o.address && <small>{o.address}</small>}
          </span>
        </button>
      ))}
    </div>
  );
};

// the insurances the doctor accepts: shown before booking, picked on checkout
export const InsuranceNote = ({ names }: { names: string[] }) => {
  const getContent = useScopedLocale(NS);
  const sep = useListSeparator();
  const list = names.filter(Boolean);
  return (
    <div className={classes.insurance}>
      <span className={`${classes.miniIcon} tone-teal`}>
        <Ixon width="0.9rem">
          <ShieldCheckIcon />
        </Ixon>
      </span>
      <span>
        {list.length ? getContent("bfAcceptsInsurances", [list.join(sep)]) : getContent("bfNoInsuranceContract")}
      </span>
    </div>
  );
};
