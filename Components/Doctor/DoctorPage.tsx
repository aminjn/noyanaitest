"use client";
import {
  Fragment,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import classes from "./DoctorPage.module.css";
import BreadCrump from "@/Components/UI/BreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useMap from "@/Components/Hooks/useMap";
import HostedImage from "@/Components/UI/HostedImage";
import Ixon from "@/Components/UI/Ixon";
import FaqList from "@/Components/UI/FaqList";
import MapMarker from "@/Components/UI/MapMarker";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import DoctorGallery from "@/Components/Dr/DoctorGallery";
import { IDoctor } from "@/Components/Admin/Doctor/AdminManageDoctorsPage";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import {
  SocialMedia,
  socialMediaIcons,
} from "@/Components/DoctorPanel/Profile/DoctorManageSocialMediaTab";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import ShareIcon from "@/Components/Icons/ShareIcon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import InfoiCircleIcon from "@/Components/Icons/InfoiCircleIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import MountIcon from "@/Components/Icons/MountIcon";
import WebsiteIcon from "@/Components/Icons/WEbsiteIcon";
import LandLineIcon from "@/Components/Icons/LandlineIcon";
import MobileIcon from "@/Components/Icons/MobileIcon";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { tmdMedium } from "@/Components/UI/Typography";

const NS: ContentNamespace[] = ["common", "doctorPage"];

export type DoctorPageProps = {
  data: IDoctor<{
    SpecialityPopulated: Record<never, never>;
    Gallery: Record<never, never>;
  }>;
  faqs: IDoctorFaq[];
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

const ClaimProfileSidebar = ({ name }: { name: string }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.sidebar}>
      <h3 className={classes.sidebarTitle}>{getContent("isThisYou")}</h3>
      <p className={classes.sidebarLegend}>
        {`${getContent("claimProfileLegend")} ${name}`}
      </p>
      <Button
        className={classes.claimButton}
        radius="High"
        size="L"
        variant="Primary"
        href="/onboarding"
      >
        {getContent("claimThisProfile")}
      </Button>
    </div>
  );
};

const DoctorPage = ({ data, faqs }: DoctorPageProps) => {
  const getContent = useScopedLocale(NS);

  const fullName = data.name || getContent("noName");

  const aboutRef = useRef<HTMLDivElement>(null);
  const specialityRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const tabs: {
    id: string;
    ref: RefObject<HTMLDivElement>;
    label: ContentKey;
  }[] = useMemo(
    () => [
      { id: "dr-about", ref: aboutRef, label: "about" },
      { id: "dr-speciality", ref: specialityRef, label: "mainSpeciality" },
      { id: "dr-gallery", ref: galleryRef, label: "gallery" },
      { id: "dr-address", ref: addressRef, label: "contactInfo" },
      { id: "dr-faq", ref: faqRef, label: "faqs" },
    ],
    [],
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

  const addressMapRef = useRef<HTMLDivElement>(null);
  const mapCoords: [number, number] | undefined =
    data.lat && data.lng ? [data.lng, data.lat] : undefined;
  const { map: addressMap, ready: addressMapReady } = useMap({
    containerRef: addressMapRef,
    center: mapCoords,
  });

  const galleryItems = useMemo(
    () =>
      (data.gallery || [])
        .filter((el) => el.image)
        .map((el) => ({ src: el.image || "", alt: el.alt || fullName })),
    [data.gallery, fullName],
  );

  const socials = useMemo(
    () =>
      (
        [
          { kind: "Instagram" as SocialMedia, target: data.instagram },
          { kind: "Telegarm" as SocialMedia, target: data.telegram },
          { kind: "Aparat" as SocialMedia, target: data.aparat },
        ] satisfies { kind: SocialMedia; target?: string }[]
      ).filter(
        (social): social is { kind: SocialMedia; target: string } =>
          !!social.target,
      ),
    [data.instagram, data.telegram, data.aparat],
  );

  return (
    <Fragment>
      <BreadCrump
        trail={[
          { title: getContent("home"), target: "/" },
          { title: getContent("doctors"), target: "/doctors" },
          { title: fullName, target: `/doctor/${data.slug || data._id}` },
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
                href="/doctors"
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
                src={data.image}
                fill
                sizes="7rem"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={classes.identityDetails}>
              <div className={classes.identityTop}>
                <h1 className={classes.name}>{fullName}</h1>
                {!!data.speciality?.name && (
                  <Badge>{data.speciality.name}</Badge>
                )}
              </div>
              {!!data.address && (
                <div className={classes.identityMeta}>
                  <span className={classes.metaItem}>
                    <Ixon width="1rem">
                      <LocationIcon />
                    </Ixon>
                    <span>{data.address}</span>
                  </span>
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
          <ClaimProfileSidebar name={fullName} />
        </div>
        <div className={classes.cardBottom}>
          <SectionCard
            id="dr-about"
            sectionRef={aboutRef}
            icon={<InfoiCircleIcon />}
            title={getContent("about")}
          >
            {data.description ? (
              <p className={classes.paragraph}>{data.description}</p>
            ) : (
              <EmptyState>{getContent("nothingFound")}</EmptyState>
            )}
          </SectionCard>

          <SectionCard
            id="dr-speciality"
            sectionRef={specialityRef}
            icon={<StetoscopeIcon />}
            title={getContent("mainSpeciality")}
          >
            {data.speciality?.name ? (
              <div className={classes.pillRow}>
                <Badge
                  color="Primarylight"
                  size="XXL"
                  radius="High"
                  mode="Fill"
                >
                  {data.speciality.name}
                </Badge>
              </div>
            ) : (
              <EmptyState>{getContent("nothingFound")}</EmptyState>
            )}
          </SectionCard>

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

          <SectionCard
            id="dr-address"
            sectionRef={addressRef}
            icon={<LocationIcon />}
            title={getContent("contactInfo")}
          >
            {!data.address &&
            !mapCoords &&
            !data.site &&
            !data.landLine &&
            !data.mobile &&
            !socials.length ? (
              <EmptyState>{getContent("nothingFound")}</EmptyState>
            ) : (
              <Fragment>
                {!!mapCoords && (
                  <div className={classes.map} ref={addressMapRef}>
                    {addressMapReady && (
                      <MapMarker
                        lng={mapCoords[0]}
                        lat={mapCoords[1]}
                        map={addressMap}
                        variant="active"
                      />
                    )}
                  </div>
                )}
                {!!data.address && (
                  <p className={classes.paragraph}>
                    <Ixon width="1rem">
                      <LocationIcon />
                    </Ixon>
                    <span>{data.address}</span>
                  </p>
                )}
                {!!data.site && (
                  <p className={classes.paragraph}>
                    <Ixon width="1rem">
                      <WebsiteIcon />
                    </Ixon>
                    <a href={data.site} target="_blank" rel="noreferrer">
                      {data.site}
                    </a>
                  </p>
                )}
                {!!data.landLine && (
                  <p className={classes.paragraph}>
                    <Ixon width="1rem">
                      <LandLineIcon />
                    </Ixon>
                    <a href={`tel:${data.landLine}`}>{data.landLine}</a>
                  </p>
                )}
                {!!data.mobile && (
                  <p className={classes.paragraph}>
                    <Ixon width="1rem">
                      <MobileIcon />
                    </Ixon>
                    <a href={`tel:${data.mobile}`}>{data.mobile}</a>
                  </p>
                )}
                {!!socials.length && (
                  <div className={classes.socialsRow}>
                    {socials.map((social) => (
                      <a
                        key={social.kind}
                        className={classes.socialLink}
                        rel="nofollow noreferrer"
                        target="_blank"
                        href={social.target}
                        aria-label={social.kind}
                      >
                        <Ixon width="1.125rem">
                          {socialMediaIcons[social.kind]}
                        </Ixon>
                      </a>
                    ))}
                  </div>
                )}
              </Fragment>
            )}
          </SectionCard>

          {!!faqs.length && (
            <div id="dr-faq" ref={faqRef} className={classes.section}>
              <FaqList items={faqs} />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default DoctorPage;
