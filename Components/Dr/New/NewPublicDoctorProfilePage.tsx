"use client";
import { officeAddressText } from "@/Components/DoctorPanel/Office/officeAddress";
import {
  Fragment,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import Link from "@/Components/i18n/Link";
import { PublicDoctorProfilePageProps } from "../publicDoctorTypes";
import classes from "./NewPublicDoctorProfilePage.module.css";
import BreadCrump from "@/Components/UI/BreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import HostedImage from "@/Components/UI/HostedImage";
import Ixon from "@/Components/UI/Ixon";
import FaqList from "@/Components/UI/FaqList";
import dynamic from "next/dynamic";

// the map library loads after the page, not before it
const PlaceLocationCard = dynamic(
  () => import("@/Components/Map/PlaceLocationCard"),
  { ssr: false },
);
import { toLatLng } from "@/Components/Map/nexamap";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
  doctorSessionTypes,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import DoctorGallery from "../DoctorGallery";
import { DoctorConfig } from "../PublicDrSessions";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import ShareIcon from "@/Components/Icons/ShareIcon";
import VerifyIcon from "@/Components/Icons/VerifyIcon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import StarIcon from "@/Components/Icons/StarIcon";
import MedalStarIcon from "@/Components/Icons/MedalStarIcon";
import InfoiCircleIcon from "@/Components/Icons/InfoiCircleIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import MountIcon from "@/Components/Icons/MountIcon";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { tmdMedium } from "@/Components/UI/Typography";
import Badge from "@/Components/UI/Badge";
import DoctorReviews from "./DoctorReviews";
import InsuranceCoverage from "./InsuranceCoverage";
import BookingSidebar from "./BookingSidebar";
import DoctorContact from "./DoctorContact";
import Button from "@/Components/UI/Button";

const NS: ContentNamespace[] = ["common", "drProfile"];

const visitTypeTagClass: Record<DoctorSessionType, string> = {
  videoCall: classes.tagSecondary,
  sipCall: classes.tagWarning,
  voiceCall: classes.tagWarning,
  textChat: classes.tagSuccess,
  inPerson: classes.tagPrimary,
};

const SectionCard = ({
  id,
  sectionRef,
  icon,
  title,
  children,
}: {
  id: string;
  sectionRef: RefObject<HTMLDivElement>;
  icon: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) => (
  <div id={id} ref={sectionRef} className={classes.section}>
    <div className={classes.sectionHeading}>
      <Ixon width="1.25rem" className={classes.sectionIcon}>
        {icon}
      </Ixon>
      <h2 className={`${classes.sectionTitle} ${tmdMedium}`}>{title}</h2>
    </div>
    <div className={classes.sectionBody}>{children}</div>
  </div>
);

const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className={classes.emptyState}>{children}</p>
);

const NewDoctorProfilePage = ({
  doctor,
  faqs,
}: PublicDoctorProfilePageProps) => {
  const getContent = useScopedLocale(NS);
  const specialityChips = (() => {
    const list = [
      doctor.mainSpeciality,
      ...(((doctor as { specialities?: unknown[] }).specialities ||
        []) as unknown[]),
    ].filter(
      (el): el is { _id: string; name?: string; slug?: string } =>
        !!el && typeof el === "object" && !!(el as { name?: string }).name,
    );
    return list.filter(
      (el, i) => list.findIndex((o) => o._id === el._id) === i,
    );
  })();

  // the catalogue services (populated); an old free-text entry or a broken
  // reference is skipped, never crashes the page
  const serviceChips = (
    (Array.isArray(doctor.serviceCategories)
      ? doctor.serviceCategories
      : []) as unknown[]
  ).filter(
    (el): el is { _id: string; title: string } =>
      !!el &&
      typeof el === "object" &&
      typeof (el as { _id?: unknown })._id === "string" &&
      !!(el as { title?: string }).title,
  );

  const fullName = getDoctorProfileLabel(doctor);
  // the council number patients check a doctor by (Paziresh24 / Doctolib
  // show it on the profile), and the tick: an account with that number on
  // record - the same rule as the doctor card (Components/UI/DoctorCardAlt)
  const councilCode = (doctor as { medicalSystemCode?: string }).medicalSystemCode;
  const claimed = (doctor as { claimed?: boolean }).claimed !== false;
  const verified = claimed && !!(doctor.mcCode || councilCode);

  const { data: config } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // the visit types a patient can book (the server's rule, as on the card)
  const activeTypes = useMemo(
    () =>
      config
        ? doctorSessionTypes.filter((st) =>
            Array.isArray(config.sessionTypes)
              ? config.sessionTypes.includes(st)
              : !!config[st]?.active,
          )
        : [],
    [config],
  );

  const aboutRef = useRef<HTMLDivElement>(null);
  const specialityRef = useRef<HTMLDivElement>(null);
  const recordsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const hasRecords = !!doctor.achivements?.length;
  const hasGallery = !!doctor.gallery?.some((el) => !!el?.image);
  const hasFaqs = Array.isArray(faqs) && faqs.length > 0;

  const tabs: {
    id: string;
    ref: RefObject<HTMLDivElement>;
    label: ContentKey;
  }[] = useMemo(
    () => [
      { id: "dr-about", ref: aboutRef, label: "about" },
      {
        id: "dr-speciality",
        ref: specialityRef,
        label: "specialityAndServices",
      },
      // sections with nothing in them are left out (tab and card): a row
      // of "nothing found" boxes made a new profile look abandoned
      ...(hasRecords
        ? [
            {
              id: "dr-records",
              ref: recordsRef,
              label: "recordsAndDocuments" as ContentKey,
            },
          ]
        : []),
      ...(hasGallery
        ? [
            {
              id: "dr-gallery",
              ref: galleryRef,
              label: "gallery" as ContentKey,
            },
          ]
        : []),
      { id: "dr-reviews", ref: reviewsRef, label: "patientReviews" },
      { id: "dr-address", ref: addressRef, label: "address" },
      // the FAQ block is only drawn when there are questions: its tab
      // scrolled to nothing
      ...(hasFaqs
        ? [{ id: "dr-faq", ref: faqRef, label: "faqs" as ContentKey }]
        : []),
    ],
    [hasRecords, hasGallery, hasFaqs],
  );

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    tabs.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, [tabs]);

  const primaryOffice = doctor.offices?.[0];
  // the office first: the doctor's own point is derived from it on the
  // backend (Lib/doctorLocation.ts); lat / lng is the legacy import copy
  const mapCoords = useMemo<[number, number] | undefined>(
    () =>
      (primaryOffice?.location?.coordinates as [number, number] | undefined) ||
      (doctor.location?.coordinates as [number, number] | undefined) ||
      (doctor.lat && doctor.lng ? [doctor.lng, doctor.lat] : undefined),
    [primaryOffice, doctor.location, doctor.lat, doctor.lng],
  );
  // one "how to get there" card per office on the map; a doctor without
  // offices on the map but with a point of their own gets one card for it
  const locationCards = useMemo(() => {
    const offices = (Array.isArray(doctor.offices) ? doctor.offices : [])
      .filter((o) => !!o && toLatLng(o.location?.coordinates))
      .map((o) => ({
        key: o._id,
        coords: o.location?.coordinates as number[],
        name: o.name,
        address: officeAddressText(o as { address?: string }),
      }));
    if (offices.length) return offices;
    return toLatLng(mapCoords)
      ? [
          {
            key: "doctor",
            coords: mapCoords as number[],
            name: undefined,
            address: doctor.address || primaryOffice?.address,
          },
        ]
      : [];
  }, [doctor.offices, doctor.address, mapCoords, primaryOffice?.address]);
  const displayAddress = doctor.address || primaryOffice?.address;

  const galleryItems = useMemo(
    () =>
      (Array.isArray(doctor.gallery) ? doctor.gallery : [])
        .filter((el) => el?.image)
        .map((el) => ({ src: el.image || "", alt: el.alt || fullName })),
    [doctor.gallery, fullName],
  );

  return (
    <Fragment>
      <BreadCrump
        trail={[
          { title: getContent("home"), target: "/" },
          { title: getContent("doctors"), target: "/book" },
          { title: fullName, target: `/dr/${doctor.slug || doctor._id}` },
        ]}
      />
      <div className={classes.content}>
        <div className={classes.cardTop}>
          <div className={classes.banner}>
            <div className={classes.bannerActions}>
              <button
                type="button"
                className={classes.bannerButton}
                aria-label="share"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const nav = window.navigator as Navigator & {
                    share?: (data: {
                      title?: string;
                      url?: string;
                    }) => Promise<void>;
                  };
                  nav
                    .share?.({ title: fullName, url: window.location.href })
                    ?.catch(() => undefined);
                }}
              >
                <Ixon width="1rem">
                  <ShareIcon />
                </Ixon>
              </button>
              <Link
                href="/book"
                className={classes.bannerButton}
                aria-label="back"
              >
                <Ixon width="1rem">
                  <ArrowLeftIcon />
                </Ixon>
              </Link>
            </div>
          </div>
          <div className={classes.identity}>
            <div className={classes.identityImage}>
              <HostedImage
                alt={fullName}
                src={doctor.avatar}
                fill
                sizes="7rem"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={classes.identityDetails}>
              <div className={classes.identityTop}>
                <h1 className={classes.name}>{fullName}</h1>
                {verified && (
                  <Ixon width="1rem" className={classes.verifiedIcon}>
                    <VerifyIcon />
                  </Ixon>
                )}
                {!!doctor.mainSpeciality?.name && (
                  // the main speciality opens its doctors
                  <Link
                    href={`/speciality/${doctor.mainSpeciality.slug || doctor.mainSpeciality._id}`}
                  >
                    <Badge>{doctor.mainSpeciality.name}</Badge>
                  </Link>
                )}
              </div>
              <div className={classes.identityMeta}>
                {!!councilCode && (
                  <span className={classes.metaItem}>
                    <span>{getContent("medicalSystemCode")}:</span>
                    <b>{councilCode}</b>
                  </span>
                )}
                {!!displayAddress && (
                  <span className={classes.metaItem}>
                    <Ixon width="1rem">
                      <LocationIcon />
                    </Ixon>
                    <span>{displayAddress}</span>
                  </span>
                )}
                {!!doctor.feedbackCount && (
                  <span className={classes.metaItem}>
                    <Ixon width="1rem" className={classes.ratingIcon}>
                      <StarIcon />
                    </Ixon>
                    <b>{doctor.averageScore?.toFixed(1)}</b>
                    <span>{`(${currencize(
                      doctor.feedbackCount,
                    )} ${getContent("comments")})`}</span>
                  </span>
                )}
              </div>
              {!!activeTypes.length && (
                <div className={classes.identityTags}>
                  {activeTypes.map((st) => (
                    <span key={st} className={visitTypeTagClass[st]}>
                      {getContent(doctorSessionTypeContentKeyDict[st])}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <nav className={classes.tabs}>
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`${classes.tab} ${
                  activeTab === tab.id ? classes.tabActive : ""
                }`}
                onClick={() =>
                  tab.ref.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                {getContent(tab.label)}
              </button>
            ))}
          </nav>
        </div>
        <div className={classes.side}>
          {(doctor as { claimed?: boolean }).claimed === false ? (
            // imported from the old directory, no account yet: no booking
            // widget (it would show empty slots) - a way to claim instead
            <div className={classes.unclaimed}>
              <h3 className={classes.unclaimedTitle}>
                {getContent("unclaimedProfileTitle")}
              </h3>
              <p className={classes.unclaimedLegend}>
                {getContent("unclaimedProfileLegend")}
              </p>
              <Button
                href="/become/doctor"
                variant="Primary"
                mode="Outline"
                size="M"
                radius="High"
              >
                {getContent("claimThisProfile")}
              </Button>
            </div>
          ) : (
            <BookingSidebar doctor={doctor} />
          )}
        </div>
        <div className={classes.cardBottom}>
          <SectionCard
            id="dr-about"
            sectionRef={aboutRef}
            icon={<InfoiCircleIcon />}
            title={getContent("about")}
          >
            {doctor.introduction ? (
              <p className={classes.paragraph}>{doctor.introduction}</p>
            ) : (
              <EmptyState>{getContent("nothingFound")}</EmptyState>
            )}
            {!!config?.insurances.length && (
              <div className={classes.subBlock}>
                {/* «پوشش بیمه»: accepted insurances, the estimated share
                    where a tariff covers the visit (2026-10) */}
                <h3 className={classes.subTitle}>{getContent("drInsCoverage")}</h3>
                <InsuranceCoverage
                  doctorId={doctor._id}
                  fallback={config.insurances.map((inc) => ({ _id: inc._id, name: inc.insurance?.name }))}
                />
              </div>
            )}
          </SectionCard>
          <SectionCard
            id="dr-speciality"
            sectionRef={specialityRef}
            icon={<StetoscopeIcon />}
            title={getContent("specialityAndServices")}
          >
            {/* every speciality of the doctor (main first), each a link to
                that speciality's doctors - they used to be loaded, not shown */}
            {!!specialityChips.length && (
              <div className={classes.chips}>
                {specialityChips.map((sp) => (
                  <Link key={sp._id} href={`/speciality/${sp.slug || sp._id}`}>
                    <Badge color="Primarylight" mode="Fill" radius="High">
                      {sp.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            {/* the services come from the catalogue (2026-10): each opens
                the doctors who offer it on /book, as a speciality does */}
            {!serviceChips.length ? (
              !specialityChips.length && (
                <EmptyState>{getContent("nothingFound")}</EmptyState>
              )
            ) : (
              <ul className={classes.serviceChips}>
                {serviceChips.map((service) => (
                  <li key={service._id}>
                    <Link
                      href={`/book?${new URLSearchParams({
                        service: service._id,
                        name: service.title || "",
                      }).toString()}`}
                    >
                      <Badge color="Primarylight" mode="Outline" radius="High">
                        {service.title}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {hasRecords && (
            <SectionCard
              id="dr-records"
              sectionRef={recordsRef}
              icon={<MedicalRecordIcon />}
              title={getContent("recordsAndDocuments")}
            >
              {!doctor.achivements.length ? (
                <EmptyState>{getContent("nothingFound")}</EmptyState>
              ) : (
                <ul className={classes.list}>
                  {doctor.achivements.map((achivement, i) => (
                    <li
                      key={`${achivement}${i}`}
                      className={classes.achivement}
                    >
                      <Ixon width="1.125rem" className={classes.achivementIcon}>
                        <MedalStarIcon />
                      </Ixon>
                      <span>{achivement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}

          {hasGallery && (
            <SectionCard
              id="dr-gallery"
              sectionRef={galleryRef}
              icon={<MountIcon />}
              title={getContent("gallery")}
            >
              {!galleryItems.length ? (
                <EmptyState>{getContent("nothingFound")}</EmptyState>
              ) : (
                <DoctorGallery items={galleryItems} />
              )}
            </SectionCard>
          )}

          <SectionCard
            id="dr-reviews"
            sectionRef={reviewsRef}
            icon={<StarIcon />}
            title={
              <span className={classes.reviewsTitle}>
                {!!doctor.feedbackCount && (
                  <span className={classes.reviewsCount}>{`(${currencize(
                    doctor.feedbackCount,
                  )})`}</span>
                )}
                <span>{getContent("patientReviews")}</span>
              </span>
            }
          >
            {/* verified visit reviews only (one per completed visit) */}
            <DoctorReviews doctorId={doctor._id} />
          </SectionCard>

          <SectionCard
            id="dr-address"
            sectionRef={addressRef}
            icon={<LocationIcon />}
            title={getContent("address")}
          >
            {!displayAddress && !locationCards.length ? (
              // the contact links below may be all there is
              !(doctor.website || doctor.landLine || doctor.socials?.length) && (
                <EmptyState>{getContent("nothingFound")}</EmptyState>
              )
            ) : locationCards.length ? (
              <div className={classes.locations}>
                {locationCards.map((card) => (
                  <PlaceLocationCard
                    key={card.key}
                    coords={card.coords}
                    name={card.name}
                    address={card.address}
                  />
                ))}
              </div>
            ) : (
              <p className={classes.paragraph}>
                <Ixon width="1rem">
                  <LocationIcon />
                </Ixon>
                <span>{displayAddress}</span>
              </p>
            )}
            <DoctorContact
              website={doctor.website}
              landLine={doctor.landLine}
              socials={doctor.socials}
            />
          </SectionCard>

          {hasFaqs && (
            <div id="dr-faq" ref={faqRef} className={classes.section}>
              <FaqList items={faqs} />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default NewDoctorProfilePage;
