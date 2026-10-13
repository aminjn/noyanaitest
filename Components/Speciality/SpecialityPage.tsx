"use client";

import { useMemo, useState } from "react";
import classes from "./SpecialityPage.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { DoctorSessionType } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import Ixon from "../UI/Ixon";
import SpecialityIcon from "../Icons/speciality/SpecialityIcon";
import UserGroupIcon from "../Icons/UserGroupIcon";
import Button from "../UI/Button";
import ArrowCircleDownIcon from "../Icons/ArrowCircleDownIcon";
import BookingPage2, { BookingPageDoctor } from "../Booking/BookingPage2";
import BigAd from "../UI/ListPage/BigAd";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";
import { t2xlRegular, tmdDemiBold, tsmMedium } from "../UI/Typography";
import Link from "@/Components/i18n/Link";

const NS: ContentNamespace[] = ["common", "specialityPage"];

// getSpeciality returns Doctor and DoctorProfile rows merged into one
// paginated list, each tagged with the collection it came from.
export type SpecialityDoctorProfileRow = IDoctorProfile<{
  MainSpecialityPopulated: Record<never, never>;
  TextChatSettings: Record<never, never>;
  SipCallSettings: Record<never, never>;
  InPersonSettings: Record<never, never>;
  VideoCallSettings: Record<never, never>;
  VoiceCallSettings: Record<never, never>;
  Province: Record<never, never>;
}> & { sessionTypes: DoctorSessionType[]; model: "DoctorProfile" };

export type SpecialityPageProps = {
  data: ISpeciality<{ Category: Record<never, never> }>;
  doctors: SpecialityDoctorProfileRow[];
  pagesCount: number;
  count: number;
  // the diseases linked to this speciality (published ones)
  diseases?: { _id: string; name?: string; slug?: string }[];
};

const SpecialityPage = ({
  data,
  doctors,
  pagesCount,
  count,
  diseases,
}: SpecialityPageProps) => {
  const getContent = useScopedLocale(NS);
  const [aboutOpen, setAboutOpen] = useState(false);
  // the speciality's summary, else the start of its description as text
  const { aboutText, aboutTruncated } = useMemo(() => {
    const summary = typeof data.summary === "string" ? data.summary.trim() : "";
    const plain = String(data.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (summary) return { aboutText: summary, aboutTruncated: plain.length > 0 };
    if (!plain) return { aboutText: "", aboutTruncated: false };
    const cut = plain.length > 320 ? `${plain.slice(0, 320).replace(/\s+\S*$/, "")}…` : plain;
    return { aboutText: cut, aboutTruncated: plain.length > 320 };
  }, [data.summary, data.description]);

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("specialities"), target: "/speciality" },
        {
          title: data.name || data._id,
          target: `/speciality/${data.slug || data._id}`,
        },
      ]}
    >
      <div className={classes.header}>
        <div className={`${classes.headerIcon} glassIcon`}>
          <Ixon width="1.5rem">
            <SpecialityIcon node={data} />
          </Ixon>
        </div>
        <div className={classes.headerContent}>
          <div className={classes.headerIntro}>
            <h1 className={`${classes.h1} ${t2xlRegular}`}>{data.name}</h1>
            <div className={classes.doctorsCount}>
              <Ixon width=".75rem">
                <UserGroupIcon />
              </Ixon>
              <span>{getContent("nDoctors", [count.toString()])}</span>
            </div>
          </div>
        </div>
        {!!aboutText && (
          <div className={classes.headActions}>
            <Button
              variant="Primary"
              mode="Inline"
              size="S"
              radius="High"
              tailIcon={
                <span style={{ display: "inline-flex", transform: aboutOpen ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>
                  <ArrowCircleDownIcon />
                </span>
              }
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              aria-controls="speciality-about-short"
            >
              {getContent("aboutThisSpeciality")}
            </Button>
          </div>
        )}
      </div>
      {/* «درباره این تخصص» opens a short text right here (2026-10); the
          full description stays at the bottom of the page */}
      {aboutOpen && !!aboutText && (
        <div id="speciality-about-short" className={classes.aboutShort}>
          <p>{aboutText}</p>
          {aboutTruncated && (
            <a href="#about" className={classes.aboutMore}>
              {getContent("seeMore")}
            </a>
          )}
        </div>
      )}
      {/* the doctors of this speciality with every filter always open
          beside them (2026-10, like Doctolib / Zocdoc result pages): the
          server-rendered first page shows until a filter changes */}
      <BookingPage2
        embedded
        preset={{ speciality: [data] }}
        initialRows={{
          rows: (Array.isArray(doctors) ? doctors : []) as unknown as BookingPageDoctor[],
          count,
        }}
      />
      <div className={classes.box} id="about">
        <BigAd
          position="speciality1"
          resourceModel="Speciality"
          resource={data._id}
        />
        <RenderRtf value={data.description} />
        {!!diseases?.length && (
          <section className={classes.diseases}>
            <h2 className={tmdDemiBold}>{getContent("relatedDiseases")}</h2>
            <ul className={classes.diseaseList}>
              {diseases.map((el) => (
                <li key={el._id}>
                  <Link
                    href={`/disease/${el.slug || el._id}`}
                    className={`${classes.diseaseLink} ${tsmMedium}`}
                  >
                    {el.name || el._id}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <SmallAd
        position="speciality2"
        resourceModel="Speciality"
        resource={data._id}
      />
    </ListPageLayout>
  );
};

export default SpecialityPage;
