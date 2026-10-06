"use client";

import useSWR from "swr";
import { useMemo } from "react";
import classes from "./ProfileStrength.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useDoctor from "@/Components/Hooks/useDoctor";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

// same keys/fetchers as the tabs, so SWR shares the cache
const listFetcher = (url: string) => fetcher({ url }).then((res) => res.data);
const count = (v: unknown) => (Array.isArray(v) ? v.length : 0);

type Item = { key: ContentKey; done: boolean; tab: string };

// Zocdoc / Doctolib-style profile strength: what's missing from the public
// profile, each item jumping to the tab that fixes it.
const ProfileStrength = ({ onGo }: { onGo: (tab: string) => void }) => {
  const { doctor } = useDoctor();
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const { data: gallery } = useSWR(`${API}/doctor/gallery`, listFetcher);
  const { data: socials } = useSWR(`${API}/doctor/social`, listFetcher);
  const { data: faqs } = useSWR(`${API}/doctor/faq`, listFetcher);
  const { data: offices } = useSWR(`${API}/doctor/office`, listFetcher);
  // an active office with its phone and address is a reachable practice too
  const officeContact = (Array.isArray(offices) ? offices : []).some(
    (o: { active?: boolean; tel?: string; address?: string }) => o && o.active !== false && !!o.tel && !!o.address,
  );

  const items = useMemo<Item[]>(() => {
    if (!doctor) return [];
    const coords = doctor.location?.coordinates;
    return [
      { key: "ppItemAvatar", done: !!doctor.avatar, tab: "Details" },
      { key: "ppItemSpeciality", done: !!doctor.mainSpeciality, tab: "Details" },
      { key: "ppItemIntro", done: (doctor.introduction || "").trim().length >= 80, tab: "Details" },
      { key: "ppItemServices", done: count(doctor.services) > 0, tab: "Details" },
      { key: "ppItemContact", done: (!!doctor.landLine && !!doctor.address) || officeContact, tab: "Details" },
      {
        key: "ppItemLocation",
        done: (Array.isArray(coords) && coords.length === 2) || (!!doctor.lat && !!doctor.lng),
        tab: "Location",
      },
      { key: "ppItemGallery", done: count(gallery) > 0, tab: "Gallery" },
      { key: "ppItemSocial", done: count(socials) > 0, tab: "Social" },
      { key: "ppItemFaq", done: count(faqs) > 0, tab: "Faq" },
    ];
  }, [doctor, gallery, socials, faqs, officeContact]);

  if (!doctor || !items.length) return null;
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const pctText = new Intl.NumberFormat(intlTag, { style: "percent" }).format(pct / 100);

  return (
    <section className={classes.main}>
      <div className={classes.head}>
        <div className={classes.ring} style={{ ["--p" as string]: `${pct}` }} aria-hidden>
          <span>{pctText}</span>
        </div>
        <div className={classes.text}>
          <strong>{getContent("ppStrength")}</strong>
          <span>{pct === 100 ? getContent("ppDone") : getContent("ppStrengthHint")}</span>
        </div>
        {!!doctor.slug && (
          <Link href={`/dr/${doctor.slug}`} className={classes.public} target="_blank">
            <Ixon width="1rem">
              <EyeIcon />
            </Ixon>
            {getContent("ppViewPublic")}
          </Link>
        )}
      </div>
      {pct < 100 && (
        <ul className={classes.items}>
          {items.map((i) => (
            <li key={i.key}>
              <button
                type="button"
                className={`${classes.item} ${i.done ? classes.done : ""}`}
                onClick={() => onGo(i.tab)}
                disabled={i.done}
              >
                <span className={classes.check} aria-hidden>
                  {i.done && (
                    <Ixon width="0.75rem">
                      <CheckIcon />
                    </Ixon>
                  )}
                </span>
                {getContent(i.key)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProfileStrength;
