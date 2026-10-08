"use client";

import { ReactNode } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Ixon from "@/Components/UI/Ixon";
import WebsiteIcon from "@/Components/Icons/WEbsiteIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import InstagramIcon from "@/Components/Icons/InstagramIcon";
import TelegramIcon from "@/Components/Icons/TelegramIcon";
import WhatsappIcon from "@/Components/Icons/WhatsappIcon";
import AparatIcon from "@/Components/Icons/AparatIcon";
import classes from "./DoctorContact.module.css";

const NS: ContentNamespace[] = ["common", "drProfile"];

type Social = { _id?: string; media?: string; target?: string };

const socialView: Record<string, { key: ContentKey; icon: ReactNode; host: RegExp }> = {
  Instagram: { key: "instagram", icon: <InstagramIcon />, host: /^https:\/\/(www\.)?instagram\.com\//i },
  Telegarm: { key: "telegram", icon: <TelegramIcon />, host: /^https:\/\/t\.me\//i },
  Whatsapp: { key: "whatsapp", icon: <WhatsappIcon />, host: /^https:\/\/wa\.me\//i },
  Aparat: { key: "aparat", icon: <AparatIcon />, host: /^https:\/\/(www\.)?aparat\.com\//i },
};

// only an http(s) address is ever linked (the backend checks it too,
// Lib/contactLinks.ts)
const safeUrl = (raw?: string) => {
  const v = (raw || "").trim();
  if (!v) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};

// The doctor's own contact links on /dr (2026-10): the website, the
// office land line and the social pages the doctor fills in on their
// profile - they were editable but shown nowhere. External links open in
// a new tab with rel="nofollow noopener noreferrer" (a doctor's link is
// not the site's endorsement); the phone dials.
const DoctorContact = ({
  website,
  landLine,
  socials,
}: {
  website?: string;
  landLine?: string;
  socials?: Social[];
}) => {
  const getContent = useScopedLocale(NS);
  const site = safeUrl(website);
  const phone = (landLine || "").replace(/[^\d+]/g, "");
  const links = (Array.isArray(socials) ? socials : []).filter(
    (s): s is Required<Pick<Social, "media" | "target">> & Social =>
      !!s?.media && !!socialView[s.media] && typeof s.target === "string" && socialView[s.media].host.test(s.target),
  );
  if (!site && !phone && !links.length) return null;
  return (
    <div className={classes.main}>
      <h3 className={classes.title}>{getContent("contactInfo")}</h3>
      {(!!site || !!phone) && (
        <div className={classes.rows}>
          {!!phone && (
            <a className={classes.row} href={`tel:${phone}`}>
              <Ixon width="1.125rem">
                <CallCallingIcon />
              </Ixon>
              <span>{getContent("landLine")}:</span>
              <span dir="ltr">{landLine}</span>
            </a>
          )}
          {!!site && (
            <a className={classes.row} href={site.toString()} target="_blank" rel="nofollow noopener noreferrer">
              <Ixon width="1.125rem">
                <WebsiteIcon />
              </Ixon>
              <span>{getContent("website")}:</span>
              <span dir="ltr">{`${site.host}${site.pathname === "/" ? "" : site.pathname}`}</span>
            </a>
          )}
        </div>
      )}
      {!!links.length && (
        <div className={classes.socials} aria-label={getContent("socialMedias")}>
          {links.map((s) => (
            <a
              key={s._id || `${s.media}${s.target}`}
              className={classes.social}
              href={s.target}
              target="_blank"
              rel="nofollow noopener noreferrer"
              title={getContent(socialView[s.media].key)}
              aria-label={getContent(socialView[s.media].key)}
            >
              <Ixon width="1.25rem">{socialView[s.media].icon}</Ixon>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorContact;
